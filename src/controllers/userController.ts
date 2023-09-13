import { Request, Response } from 'express'
import { ObjectId, startSession } from 'mongoose'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import winston from 'winston'

import {
  ICombinedRequest,
  IContextRequest,
  IUserRequest
} from '@/contracts/request'
import {
  DeleteProfilePayload,
  UpdateEmailPayload,
  UpdatePasswordPayload,
  UpdateProfilePayload
} from '@/contracts/user'
import {
  resetPasswordService,
  userService,
  verificationService
} from '@/services'
import { ExpiresInMinutes } from '@/constants'
import { addMinutesFromNow } from '@/utils/dates'
import { createCryptoString } from '@/utils/cryptoString'
import { UserMail } from '@/mailer'
import { createHash } from '@/utils/hash'
import { channelService } from '@/services/channelService'

export const userController = {
  me: async (
    { context: { user } }: IContextRequest<IUserRequest>,
    res: Response
  ) => {
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'User not found',
        status: StatusCodes.NOT_FOUND
      })
    }

    // const media = await mediaService.findOneByRef({
    //   refType: MediaRefType.User,
    //   refId: user.id
    // })

    // if (media) {
    //   image = appUrl(await new Image(media).sharp({ width: 150, height: 150 }))
    // }

    return res.status(StatusCodes.OK).json({
      data: { ...user.toJSON() },
      message: ReasonPhrases.OK,
      status: StatusCodes.OK
    })
  },

  updateUserProfile: async (
    {
      context: { user },
      body
    }: ICombinedRequest<IUserRequest, UpdateProfilePayload>,
    res: Response
  ) => {
    try {
      const userProfileAfterUpdate = await userService
        .updateProfileByUserId(user.id, {
          ...body
        })
        .populate('user_avatar_media_id')

      return res.status(StatusCodes.OK).json({
        data: userProfileAfterUpdate?.toJSON(),
        message: 'Updated successfully !',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  updateEmail: async (
    {
      context: { user },
      body: { email, password }
    }: ICombinedRequest<IUserRequest, UpdateEmailPayload>,
    res: Response
  ) => {
    const session = await startSession()

    try {
      if (user.email === email) {
        return res.status(StatusCodes.OK).json({
          data: { email },
          message: ReasonPhrases.OK,
          status: StatusCodes.OK
        })
      }

      const isUserExist = await userService.isExistByEmail(email)

      if (isUserExist) {
        return res.status(StatusCodes.CONFLICT).json({
          message: ReasonPhrases.CONFLICT,
          status: StatusCodes.CONFLICT
        })
      }

      const currentUser = await userService.getById(user.id)

      const comparePassword = currentUser?.comparePassword(password)
      if (!comparePassword) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: ReasonPhrases.FORBIDDEN,
          status: StatusCodes.FORBIDDEN
        })
      }

      session.startTransaction()

      await userService.updateEmailByUserId(user.id, email, session)

      const cryptoString = createCryptoString()

      const dateFromNow = addMinutesFromNow(ExpiresInMinutes.Verification)

      let verification =
        await verificationService.findOneAndUpdateByUserIdAndEmail(
          {
            userId: user.id,
            email,
            verification_token: cryptoString,
            expiresIn: dateFromNow
          },
          session
        )

      if (!verification) {
        verification = await verificationService.createVerification(
          {
            userId: user.id,
            email,
            verification_token: cryptoString,
            expiresIn: dateFromNow
          },
          session
        )
      }

      await userService.addChannel_VerificationToUser(
        {
          userId: user.id,
          verificationId: verification.id
        },
        session
      )

      const userMail = new UserMail()

      userMail.successfullyUpdatedEmail({ email })

      userMail.verification({
        email,
        accessToken: cryptoString
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        data: { email },
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  updatePassword: async (
    {
      context: {
        user: { id }
      },
      body: { oldPassword, newPassword }
    }: ICombinedRequest<IUserRequest, UpdatePasswordPayload>,
    res: Response
  ) => {
    try {
      const user = await userService.getById(id)

      const comparePassword = user?.comparePassword(oldPassword)

      if (!comparePassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Old Password is incorrect',
          status: StatusCodes.BAD_REQUEST
        })
      }

      const hashedNewPassword = await createHash(newPassword)

      await userService.updatePasswordByUserId(user?.id, hashedNewPassword)

      return res.status(StatusCodes.OK).json({
        message: 'Updated password successfully !',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  // updateAvatar: async (
  //   {
  //     context: { user },
  //     body: { imageId }
  //   }: ICombinedRequest<IUserRequest, { imageId: ObjectId }>,
  //   res: Response
  // ) => {
  //   try {
  //     await userController.deleteUserImages({ userId: user.id })

  //     await mediaService.updateById(imageId, {
  //       refType: MediaRefType.User,
  //       refId: user.id
  //     })

  //     return res.status(StatusCodes.OK).json({
  //       message: ReasonPhrases.OK,
  //       status: StatusCodes.OK
  //     })
  //   } catch (error) {
  //     winston.error(error)

  //     return res.status(StatusCodes.BAD_REQUEST).json({
  //       message: ReasonPhrases.BAD_REQUEST,
  //       status: StatusCodes.BAD_REQUEST
  //     })
  //   }
  // },

  deleteProfile: async (
    {
      context: {
        user: { email }
      },
      body: { password }
    }: ICombinedRequest<IUserRequest, DeleteProfilePayload>,
    res: Response
  ) => {
    const session = await startSession()

    try {
      const user = await userService.getByEmail(email)

      const comparePassword = user?.comparePassword(password)
      if (!user || !comparePassword) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: ReasonPhrases.FORBIDDEN,
          status: StatusCodes.FORBIDDEN
        })
      }
      session.startTransaction()

      await userService.deleteById(user.id, session)

      await resetPasswordService.deleteManyByUserId(user.id, session)

      await verificationService.deleteManyByUserId(user.id, session)

      const userMail = new UserMail()

      userMail.successfullyDeleted({ email: user.email })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  getListChannelsSubscribed: async (req: Request, res: Response) => {
    try {
      const channelDetail = await channelService.getChannelDetail({
        channel_id: req.params.channelId
      })

      const userDetail = await userService
        .getById(channelDetail?.channel_owner_id as ObjectId)
        .populate({
          path: 'subscribed_channels',
          model: 'Channel',
          select: ['channel_owner_id', 'channel_name', 'channel_subscribers'],
          populate: {
            path: 'channel_owner_id',
            model: 'User',
            select: ['user_avatar_media_id'],
            populate: {
              path: 'user_avatar_media_id',
              model: 'Media',
              select: ['media_url']
            }
          }
        })

      const dataSubscribedChannels = userDetail
        ?.toJSON()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.subscribed_channels.map((el: any) => {
          return {
            ...el,
            channel_image_url:
              el.channel_owner_id.user_avatar_media_id.media_url,
            channel_owner_id: undefined,
            channel_subscribers: el.channel_subscribers.length
          }
        })

      return res.status(StatusCodes.OK).json({
        data: dataSubscribedChannels,
        message: 'Get list channels subscribed successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
