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
import { getStorage, ref, deleteObject } from 'firebase/storage'
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
          video_url: req.body.mediaFilesDetails[1].url,
          video_description: req.body.video_description
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
  },

  getVideoDetailById: async (req: Request, res: Response) => {
    try {
      const video = await videoService.getVideoById(req.params.videoId)

      return res.status(StatusCodes.OK).json({
        data: { ...video?.toJSON() },
        message: 'Get video detail successfully',
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

  updateVideoDetailById: async (req: any, res: Response) => {
    try {
      let payloadSentToUpdate
      const videoPayloadToUpdate = {
        video_title: req.body.video_title,
        video_description: req.body.video_description,
        video_category_id: req.body.video_category_id
      }

      payloadSentToUpdate = { ...videoPayloadToUpdate }
      const session = await startSession()

      const videoDetail: any = await videoService
        .getVideoById(req.params.videoId)
        .populate('video_thumbnail_media_id')

      session.startTransaction()

      if (req.files['video_thumbnail']) {
        const previousVideoThumbnailToDeleteRef = ref(
          getStorage(),
          `Images/${videoDetail.video_thumbnail_media_id.media_file_name}`
        )

        deleteObject(previousVideoThumbnailToDeleteRef).catch(() => {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error in trying to delete media file in firebase storage',
            status: StatusCodes.INTERNAL_SERVER_ERROR
          })
        })

        await mediaService.createOrUpdateImage(
          {
            media_id: videoDetail.video_thumbnail_media_id,
            media_file_name: req.body.mediaFilesDetails[0].mediaFileName,
            media_type: req.body.typeImage,
            media_url: req.body.mediaFilesDetails[0].url,
            media_user_id: req.context.user.id
          },
          session
        )
      }

      if (req.files['video']) {
        const previousVideoToDeleteRef = ref(
          getStorage(),
          `Videos/${videoDetail.video_file_name}`
        )

        deleteObject(previousVideoToDeleteRef).catch(() => {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error in trying to delete media file in firebase storage',
            status: StatusCodes.INTERNAL_SERVER_ERROR
          })
        })
        payloadSentToUpdate = {
          ...videoPayloadToUpdate,
          video_file_name: req.body.mediaFilesDetails[1].mediaFileName,
          video_url: req.body.mediaFilesDetails[1].url
        }
      }

      await videoService.updateVideoById(
        videoDetail.id,
        payloadSentToUpdate,
        session
      )

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: 'Update video successfully',
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
