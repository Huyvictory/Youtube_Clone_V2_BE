import { createPlaylistPayload } from '@/contracts/playlist'
import { IBodyRequest } from '@/contracts/request'
import { userCreatePlaylist_Schema } from '@/joi/schemas/playlist'
import { NextFunction, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
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
  }
}
