/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPlaylistPayload } from '@/contracts/playlist'
import { IBodyRequest } from '@/contracts/request'
import {
  updateVideoPlaylist_Schema,
  userCreatePlaylist_Schema
} from '@/joi/schemas/playlist'
import { playlistService } from '@/services/playlistService'
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
    } catch (error: any) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.details[0].message,
        status: StatusCodes.BAD_REQUEST
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
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },
  updateVideoPlaylistValidation: async (
    req: IBodyRequest<{ videoId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await updateVideoPlaylist_Schema.validateAsync({
        videoId: req.body.videoId
      })
      next()
    } catch (error: any) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.details[0].message,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },
  isPlaylistExists: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playlistDetail = await playlistService.getPlaylistDetail({
        playlist_id: req.params.playlistId
      })

      if (!playlistDetail) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid request, please try again',
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
