import { ICombinedRequest } from '@/contracts/request'
import { IUser } from '@/contracts/user'
import { userService } from '@/services'
import { channelService } from '@/services/channelService'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { startSession } from 'mongoose'
import winston from 'winston'
import { getStorage, ref, deleteObject } from 'firebase/storage'

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
        .populate({
          path: 'channel_banner_media_id',
          model: 'Media',
          select: ['media_url']
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
  },
  updateOrCreate_ChannelBanner: async (
    {
      context: {
        user: { id }
      },
      body: { mediaUrl, typeImage, mediaFileName }
    }: ICombinedRequest<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { user: IUser },
      { mediaUrl: string; typeImage: string; mediaFileName: string }
    >,
    res: Response
  ) => {
    try {
      const session = await startSession()

      const userDetail = await userService.getById(id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const channelDetail: any = await channelService
        .getChannelDetail({
          channel_id: String(userDetail?.channel_id)
        })
        .populate('channel_banner_media_id')

      if (!channelDetail?.channel_banner_media_id) {
        session.startTransaction()
        const newChannelBanner =
          await channelService.createNewChannelBannerImage(
            {
              media_file_name: mediaFileName,
              media_type: typeImage,
              media_url: mediaUrl,
              media_user_id: String(id)
            },
            session
          )

        const newChannelDetail = await channelService
          .updateChannelDetail(
            channelDetail?.id,
            { channel_banner_media_id: newChannelBanner.id },
            session
          )
          .populate({
            path: 'channel_banner_media_id',
            model: 'Media',
            select: ['media_url']
          })

        const newChannelBannerUrl =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (newChannelDetail?.channel_banner_media_id as any).media_url

        await session.commitTransaction()
        session.endSession()

        return res.status(StatusCodes.OK).json({
          data: newChannelBannerUrl,
          message: 'Add new channel banner successfully',
          status: StatusCodes.OK
        })
      } else {
        const previousChannelBannerToDeleteRef = ref(
          getStorage(),
          `Images/${channelDetail.channel_banner_media_id.media_file_name}`
        )

        deleteObject(previousChannelBannerToDeleteRef).catch(() => {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error in trying to delete image in firebase storage',
            status: StatusCodes.INTERNAL_SERVER_ERROR
          })
        })

        const newChannelBanner = await channelService.updateChannelBannerImage({
          media_id: String(channelDetail.channel_banner_media_id._id),
          media_file_name: mediaFileName,
          media_url: mediaUrl
        })

        const newChannelBannerUrl = newChannelBanner?.media_url

        return res.status(StatusCodes.OK).json({
          data: newChannelBannerUrl,
          message: 'Update banner successfully',
          status: StatusCodes.OK
        })
      }
    } catch (error) {
      winston.error(error)
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message:
          'Error in trying to update or create your channel banner image',
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
