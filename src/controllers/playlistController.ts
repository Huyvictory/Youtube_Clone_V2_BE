import { createPlaylistPayload } from '@/contracts/playlist'
import { ICombinedRequest } from '@/contracts/request'
import { userContext } from '@/contracts/user'
import { playlistService } from '@/services/playlistService'
import { Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { startSession } from 'mongoose'
import winston from 'winston'
import { getStorage, ref, deleteObject } from 'firebase/storage'
import { mediaService } from '@/services'

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
      const playlistDetail = await playlistService
        .getPlaylistDetail({
          playlist_id: req.params.playlistId
        })
        .populate({
          path: 'playlist_respresentation_image_id',
          model: 'Media',
          select: ['media_url']
        })
        .populate({
          path: 'playlist_channel_id',
          model: 'Channel',
          select: 'channel_name'
        })
        .populate({
          path: 'playlist_videos',
          model: 'Video',
          select: [
            'video_title',
            'video_thumbnail_media_id',
            'video_views',
            'channel_id',
            'createdAt',
            'updatedAt'
          ],
          populate: [
            {
              path: 'video_thumbnail_media_id',
              model: 'Media',
              select: ['media_url']
            },
            {
              path: 'channel_id',
              model: 'Channel',
              select: ['channel_name']
            }
          ]
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
      const listPlaylists_UserChannel = await playlistService
        .getListPlaylists_UserChannel({
          channel_id: req.params.channelId
        })
        .populate({
          path: 'playlist_respresentation_image_id',
          model: 'Media',
          select: ['media_url']
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
  },
  updateNameOrDescription_Playlist: async (req: Request, res: Response) => {
    try {
      await playlistService.updateInformation_Playlist(
        { ...req.body },
        req.params.playlistId
      )

      return res.status(StatusCodes.OK).json({
        // eslint-disable-next-line quotes
        message: "Update playlist's information successfully",
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
  createOrupdateRepresentationImage_Playlist: async (
    {
      context: { user },
      body: { mediaUrl, typeImage, mediaFileName },
      params: { playlistId }
    }: ICombinedRequest<
      userContext,
      {
        mediaUrl: string
        typeImage: string
        mediaFileName: string
      },
      { playlistId: string }
    >,
    res: Response
  ) => {
    try {
      const session = await startSession()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playlistDetail: any = await playlistService
        .getPlaylistDetail({
          playlist_id: playlistId
        })
        .populate('playlist_respresentation_image_id')

      if (playlistDetail?.playlist_respresentation_image_id) {
        const previousRepresentationPlaylistToDeleteRef = ref(
          getStorage(),
          `Images/${playlistDetail.playlist_respresentation_image_id.media_file_name}`
        )

        deleteObject(previousRepresentationPlaylistToDeleteRef).catch(() => {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error in trying to delete image in firebase storage',
            status: StatusCodes.INTERNAL_SERVER_ERROR
          })
        })
      }

      session.startTransaction()

      //For case: Playlist already has representation image
      const createdOrupdatedImagePlaylist =
        await playlistService.createOrUpdateRepresentationImage_Playlist(
          {
            media_file_name: mediaFileName,
            media_type: typeImage,
            media_url: mediaUrl,
            media_user_id: String(user.id)
          },
          session,
          playlistDetail.playlist_respresentation_image_id
        )

      if (!playlistDetail.playlist_respresentation_image_id) {
        await playlistService.updateInformation_Playlist(
          {
            playlist_respresentation_image_id: createdOrupdatedImagePlaylist?.id
          },
          playlistDetail.id,
          session
        )
      }

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        data: mediaUrl,
        message: 'Update playlist image successfully',
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
  addOrDeleteVideoPlaylist: async (req: Request, res: Response) => {
    try {
      const addedOrDeletedVideo_Playlist = await playlistService
        .addOrDeleteVideoPlaylist(
          {
            videoId: req.body.videoId
          },
          req.params.playlistId
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((videoAddedOrDeleted: any) =>
          videoAddedOrDeleted
            .populate({
              path: 'playlist_videos',
              model: 'Video',
              select: [
                'video_title',
                'video_thumbnail_media_id',
                'video_views',
                'channel_id',
                'createdAt',
                'updatedAt'
              ],
              populate: [
                {
                  path: 'video_thumbnail_media_id',
                  model: 'Media',
                  select: ['media_url']
                },
                {
                  path: 'channel_id',
                  model: 'Channel',
                  select: ['channel_name']
                }
              ]
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((data: any) => data)
        )

      return res.status(StatusCodes.OK).json({
        data: addedOrDeletedVideo_Playlist.playlist_videos,
        message: 'Update video playlist successfully !',
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
  deletePlaylist: async (req: Request, res: Response) => {
    try {
      const session = await startSession()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playlistDetail: any = await playlistService
        .getPlaylistDetail({
          playlist_id: req.params.playlistId
        })
        .populate('playlist_respresentation_image_id')

      session.startTransaction()

      if (playlistDetail?.playlist_respresentation_image_id) {
        mediaService
          .deleteById(
            String(playlistDetail.playlist_respresentation_image_id._id),
            session
          )
          .then(() => {
            const representationPlaylistToDeleteRef = ref(
              getStorage(),
              `Images/${playlistDetail.playlist_respresentation_image_id.media_file_name}`
            )

            deleteObject(representationPlaylistToDeleteRef).catch(() => {
              return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Error in trying to delete image in firebase storage',
                status: StatusCodes.INTERNAL_SERVER_ERROR
              })
            })
          })
      }

      await playlistService.deletePlaylistById(
        {
          playlistId: req.params.playlistId
        },
        session
      )

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: 'Delete playlist successfully',
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

  updateRepresentationPlaylistLink: async (req: Request, res: Response) => {
    try {
      const updatedPlaylistRepresentationLink =
        await playlistService.updateRepresentationPlaylistLink({
          media_id: req.body.media_id,
          media_url: req.body.media_url
        })

      return res.status(200).json({
        new_media_url: updatedPlaylistRepresentationLink?.media_url,
        message: 'Update Playlist Representation Image Link successfully',
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
