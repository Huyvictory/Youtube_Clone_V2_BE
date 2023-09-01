import { createPlaylistPayload } from '@/contracts/playlist'
import { IBodyRequest } from '@/contracts/request'
import { userCreatePlaylist_Schema } from '@/joi/schemas/playlist'
import { NextFunction, Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import winston from 'winston'

export const playlistValidation = {
  createPlaylistValidation: async (
    req: IBodyRequest<createPlaylistPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await userCreatePlaylist_Schema.validateAsync(req.body)
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
  updateNameOrDescription: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body.playlist_name && !req.body.playlist_description) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST
        })
      }

      next()
    } catch (error) {
      winston.error(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
