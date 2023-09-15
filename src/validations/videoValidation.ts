import { NextFunction, Response } from 'express'

import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import winston from 'winston'
import { IBodyRequest } from '@/contracts/request'
import { CreateVideoCategoryPayload } from '@/contracts/videoCategory'
import { Request } from 'express-serve-static-core'
import { videoListQueryString_Schema } from '@/joi/schemas/video'
import mongoose from 'mongoose'

export const videoValidation = {
  createVideoCategoryValidation: (
    req: IBodyRequest<CreateVideoCategoryPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (
        (req.body?.video_category_names?.length as number) === 0 ||
        !req.body.video_category_names
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid request, please try again',
          status: StatusCodes.BAD_REQUEST
        })
      }

      req.body.video_category_names.forEach(({ video_category_name }) => {
        if (typeof video_category_name !== 'string') {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Invalid request, please try again',
            status: StatusCodes.BAD_REQUEST
          })
        }
      })

      return next()
    } catch (error) {
      winston.error(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },

  getListVideoValidation: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let queryStringListVideos = {}
      if (typeof req.query.videoCategory === 'string') {
        queryStringListVideos = {
          ...req.query,
          videoCategory: [req.query.videoCategory]
        }
      } else {
        queryStringListVideos = { ...req.query }
      }
      await videoListQueryString_Schema.validateAsync(queryStringListVideos)
      next()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.details[0].message,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },

  userLikeUnlikeVideoValidation: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (
        !req.body.userId ||
        !mongoose.isObjectIdOrHexString(req.body.userId)
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid request, please try again',
          status: StatusCodes.OK
        })
      }

      next()
    } catch (error) {
      winston.error(error)
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid request, please try again',
        status: StatusCodes.OK
      })
    }
  }
}
