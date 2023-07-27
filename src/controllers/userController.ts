import { Response } from 'express'
import { startSession } from 'mongoose'
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
  mediaService,
  resetPasswordService,
  userService,
  verificationService
} from '@/services'
import { ExpiresInMinutes, MediaRefType } from '@/constants'
import { addMinutesFromNow } from '@/utils/dates'
import { createCryptoString } from '@/utils/cryptoString'
import { UserMail } from '@/mailer'
import { createHash } from '@/utils/hash'

export const userController = {
  me: async (
    { context: { user } }: IContextRequest<IUserRequest>,
    res: Response
  ) => {
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND,
        status: StatusCodes.NOT_FOUND
      })
    }

    const media = await mediaService.findOneByRef({
      refType: MediaRefType.User,
      refId: user.id
    })

    let image
    // if (media) {
    //   image = appUrl(await new Image(media).sharp({ width: 150, height: 150 }))
    // }

    return res.status(StatusCodes.OK).json({
      data: { ...user.toJSON(), image },
      message: ReasonPhrases.OK,
      status: StatusCodes.OK
    })
  },

  updateProfile: async (
    {
      context: { user },
      body: { firstname, lastname }
    }: ICombinedRequest<IUserRequest, UpdateProfilePayload>,
    res: Response
  ) => {
    try {
      await userService.updateProfileByUserId(user.id, { firstname, lastname })

      const userMail = new UserMail()

      userMail.successfullyUpdatedProfile({
        email: user.email
      })

      return res.status(StatusCodes.OK).json({
        data: { firstname, lastname },
        message: ReasonPhrases.OK,
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
        user: { email }
      },
      body: { oldPassword, newPassword }
    }: ICombinedRequest<IUserRequest, UpdatePasswordPayload>,
    res: Response
  ) => {
    try {
      const user = await userService.getByEmail(email)

      const comparePassword = user?.comparePassword(oldPassword)

      if (!user || !comparePassword) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: ReasonPhrases.FORBIDDEN,
          status: StatusCodes.FORBIDDEN
        })
      }

      const hashedPassword = await createHash(newPassword)

      await userService.updatePasswordByUserId(user.id, hashedPassword)

      const userMail = new UserMail()

      userMail.successfullyUpdatedPassword({ email: user.email })

      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
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
  }

  // deleteUserImages: async ({ userId }: { userId: ObjectId }) => {
  //   const images = await mediaService.findManyByRef({
  //     refType: MediaRefType.User,
  //     refId: userId
  //   })

  //   const promises = []

  //   for (let i = 0; i < images.length; i++) {
  //     promises.push(new Image(images[i]).deleteFile())
  //   }

  //   await Promise.all(promises)

  //   await mediaService.deleteManyByRef({
  //     refType: MediaRefType.User,
  //     refId: userId
  //   })
  // }
}
