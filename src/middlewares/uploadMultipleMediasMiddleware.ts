/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { uploadMultipleFilesMedia } from '@/infrastructure/upload'

export const uploadMultipleMediasMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadMultipleFilesMedia(req, res, err => {
      if (err || !req.files['video_thumbnail'] || !req.files['video']) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Your file or request was invalid, please try again',
          status: StatusCodes.BAD_REQUEST
        })
      }

      if (
        req.files['video'][0].mimetype.split('/')[0] !== 'video' ||
        req.files['video_thumbnail'][0].mimetype.split('/')[0] !== 'image'
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid file type',
          status: StatusCodes.BAD_REQUEST
        })
      }

      Object.assign(req, {
        files: {
          ...req.files
        },
        context: { ...req.context, file: { ...req.files } },
        body: { ...req.body }
      })

      return next()
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error in proccessing your image, please try again',
      status: StatusCodes.INTERNAL_SERVER_ERROR
    })
  }
}
