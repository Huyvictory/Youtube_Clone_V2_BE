/* eslint-disable @typescript-eslint/no-explicit-any */
import { IBodyRequest } from '@/contracts/request'
import {
  CreateVideoCategoryPayload,
  IVideoCategory
} from '@/contracts/videoCategory'
import { mediaService, userService, videoService } from '@/services'
import { Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { ObjectId, startSession } from 'mongoose'
import winston from 'winston'

export const videoController = {
  createVideoCategory: async (
    {
      body: { video_category_names }
    }: IBodyRequest<CreateVideoCategoryPayload>,
    res: Response
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videoPromises: Array<IVideoCategory | null> = []

      await Promise.all(
        video_category_names.map(async ({ video_category_name }) => {
          const checkIfVideoCategoryExists =
            await videoService.isVideoCategoryExists(video_category_name)
          videoPromises.push(checkIfVideoCategoryExists)
          return checkIfVideoCategoryExists
        })
      )

      const isDuplicateVideoCategoryname = videoPromises.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        el => el !== null
      )
      if (isDuplicateVideoCategoryname) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `${isDuplicateVideoCategoryname.video_category_name} has already existed`,
          status: StatusCodes.BAD_REQUEST
        })
      }

      await videoService.createManyVideoCategories(video_category_names)
      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  createVideo: async (req: Request, res: Response) => {
    try {
      const session = await startSession()

      const userDetail = await userService.getById(req.context.user.id)

      session.startTransaction()

      const newVideoThumbnailImage = await mediaService.createOrUpdateImage(
        {
          media_id: null,
          media_file_name: req.body.mediaFilesDetails[0].mediaFileName,
          media_type: req.body.typeImage,
          media_url: req.body.mediaFilesDetails[0].url,
          media_user_id: req.context.user.id
        },
        session
      )

      await videoService.createNewVideo(
        {
          channel_id: userDetail?.channel_id as ObjectId,
          video_category_id: req.body.video_category_id,
          video_file_name: req.body.mediaFilesDetails[1].mediaFileName,
          video_thumbnail_media_id: newVideoThumbnailImage?.id,
          video_title: req.body.video_title,
          video_url: req.body.mediaFilesDetails[1].url
        },
        session
      )

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: 'Created video successfully',
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
