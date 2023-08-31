import { createPlaylistPayload } from '@/contracts/playlist'
import { ICombinedRequest } from '@/contracts/request'
import { userContext } from '@/contracts/user'
import { playlistService } from '@/services/playlistService'
import { Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import winston from 'winston'

export const playlistController = {
  createPlaylist: async (
    {
      context: { user },
      body
    }: ICombinedRequest<userContext, createPlaylistPayload>,
    res: Response
  ) => {
    try {
      await playlistService.createPlaylist({
        ...body,
        playlist_channel_id: user.channel_id,
        playlist_user_id: user.id
      })

      return res.status(StatusCodes.CREATED).json({
        message: 'Create playlist successfully',
        status: StatusCodes.CREATED
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  getPlaylistDetail: async (req: Request, res: Response) => {
    try {
      const playlistDetail = await playlistService.getPlaylistDetail({
        playlist_id: req.params.playlistId
      })

      return res.status(StatusCodes.OK).json({
        data: playlistDetail,
        message: 'Get playlist detail successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  getListPlaylists_UserChannel: async (req: Request, res: Response) => {
    try {
      const listPlaylists_UserChannel =
        await playlistService.getListPlaylists_UserChannel({
          channel_id: req.params.channelId
        })

      return res.status(StatusCodes.OK).json({
        data: listPlaylists_UserChannel,
        message: 'Get list playlists of channel successfully',
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
