import { Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import winston from 'winston'

import { ICombinedRequest } from '@/contracts/request'

export const mediaController = {
  imageUpload: async (
    {
      context: {
        file: { originalname }
      },
      body: { mediaUrl, typeMedia }
    }: ICombinedRequest<
      { file: Express.Multer.File },
      { mediaUrl: string; typeMedia: string }
    >,
    res: Response
  ) => {
    try {
      return res.status(StatusCodes.OK).json({
        data: { mediaUrl, typeMedia, file: { originalname } },
        message: 'File uploaded successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)
      // await new Image(file as Express.Multer.File).deleteFile()
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  }
}
