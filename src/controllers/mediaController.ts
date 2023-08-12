import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import winston from 'winston'

import { ICombinedRequest } from '@/contracts/request'
import { mediaService, userService } from '@/services'
import { startSession } from 'mongoose'
import { getStorage, ref, deleteObject } from 'firebase/storage'

export const mediaController = {
  updateOrCreate_UserAvatar: async (
    {
      context: {
        user: { id }
      },
      body: { mediaUrl, typeImage, mediaFileName }
    }: ICombinedRequest<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { user: any; file: Express.Multer.File },
      { mediaUrl: string; typeImage: string; mediaFileName: string }
    >,
    res: Response
  ) => {
    const session = await startSession()
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userDetail: any = await userService
        .getById(id)
        .populate('user_avatar_media_id')

      if (!userDetail) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'User not found !',
          status: StatusCodes.BAD_REQUEST
        })
      }

      //User already have avatar image then delete the previous image in firebase
      if (userDetail.user_avatar_media_id) {
        const previousAvatarToDeleteRef = ref(
          getStorage(),
          `Images/${userDetail.user_avatar_media_id.media_file_name}`
        )

        deleteObject(previousAvatarToDeleteRef).catch(() => {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error in trying to delete image in firebase storage',
            status: StatusCodes.INTERNAL_SERVER_ERROR
          })
        })
      }

      session.startTransaction()

      //update or insert new image document if not existed in current media schema
      const updatedOrCreated_Avatar = await mediaService.createOrUpdateImage(
        {
          media_id: userDetail.user_avatar_media_id,
          media_file_name: mediaFileName,
          media_type: typeImage,
          media_url: mediaUrl,
          media_user_id: userDetail.id
        },
        session
      )

      if (!userDetail.user_avatar_media_id) {
        await userService.updateUserAvatar(
          userDetail.id,
          updatedOrCreated_Avatar?.id,
          session
        )
      }

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        data: { mediaUrl },
        message: 'Update avatar successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)
      // await new Image(file as Express.Multer.File).deleteFile()
      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      //Delete image that has been saved on firebase
      deleteObject(ref(getStorage(), `Images/${mediaFileName}`)).catch(
        reason => {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: reason,
            status: StatusCodes.INTERNAL_SERVER_ERROR
          })
        }
      )

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Could not update your avatar, please try again',
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
