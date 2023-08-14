import { NextFunction, Response } from 'express'

import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import winston from 'winston'
import { IBodyRequest } from '@/contracts/request'
import { CreateVideoCategoryPayload } from '@/contracts/videoCategory'

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
  }
}
