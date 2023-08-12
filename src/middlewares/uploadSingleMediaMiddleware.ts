import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { uploadSingleMedia } from '@/infrastructure/upload'

export const uploadSingleMediaMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadSingleMedia(req, res, err => {
      if (err || !req.file || !req.body.typeMedia) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Your file or request was invalid, please try again',
          status: StatusCodes.BAD_REQUEST
        })
      }

      Object.assign(req, {
        file: {
          ...req.file
        },
        context: { ...req.context, file: { ...req.file } },
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
