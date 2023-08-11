import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { uploadSingleImage } from '@/infrastructure/upload'

export const uploadSingleImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadSingleImage(req, res, err => {
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
        context: { file: { ...req.file } },
        body: { ...req.body }
      })

      return next()
    })
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Error in proccessing your image, please try again',
      status: StatusCodes.BAD_REQUEST
    })
  }
}
