import { channelService } from '@/services/channelService'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import winston from 'winston'

export const channelController = {
  getChannelDetails: async (req: Request, res: Response) => {
    try {
      const channelDetail = await channelService
        .getChannelDetail({
          channel_id: req.context.user.channel_id
        })
        .populate({
          path: 'channel_videos',
          model: 'Video',
          select: [
            'video_thumbnail_media_id',
            'createdAt',
            'video_views',
            'video_title'
          ],
          populate: [
            {
              path: 'video_thumbnail_media_id',
              model: 'Media',
              select: ['media_url']
            }
          ]
        })
        .populate({
          path: 'channel_owner_id',
          model: 'User',
          select: ['user_avatar_media_id'],
          populate: {
            path: 'user_avatar_media_id',
            model: 'Media',
            select: ['media_url']
          }
        })

      return res.status(200).json({
        data: { channelDetail },
        message: 'Get channel detail successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error in getting channel detail',
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
