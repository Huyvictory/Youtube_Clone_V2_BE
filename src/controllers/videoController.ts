/* eslint-disable @typescript-eslint/no-explicit-any */
import { IBodyRequest } from '@/contracts/request'
import {
  CreateVideoCategoryPayload,
  IVideoCategory
} from '@/contracts/videoCategory'
import { videoService } from '@/services'
import { Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
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
  }
}
