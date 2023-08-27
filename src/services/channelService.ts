/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientSession, ObjectId } from 'mongoose'
import { ChannelSchema, MediaSchema } from '@/models'
import { IChannel } from '@/contracts/channel'

export const channelService = {
  createChannel: (
    {
      channel_name,
      channel_owner_id
    }: { channel_name: string; channel_owner_id: ObjectId },
    session?: ClientSession
  ) =>
    ChannelSchema.create(
      [
        {
          channel_name,
          channel_owner_id
        }
      ],
      { session }
    ),
  updateVideosChannel: async (
    channel_id: ObjectId,
    video_id: ObjectId,
    session?: ClientSession
  ) => {
    const ChannelDetail = await ChannelSchema.findById({ _id: channel_id })

    ChannelDetail?.channel_videos?.push(video_id)

    await ChannelDetail?.save({ session })
  },
  getChannelDetail: ({ channel_id }: { channel_id: string }) => {
    return ChannelSchema.findById({ _id: channel_id })
  },

  createNewChannelBannerImage: (
    payload: {
      media_type: string
      media_file_name: string
      media_url: string
      media_user_id: string
    },
    session: ClientSession
  ) => {
    return new MediaSchema({
      media_file_name: payload.media_file_name,
      media_type: payload.media_type,
      media_url: payload.media_url,
      media_user_id: payload.media_user_id
    }).save({ session })
  },

  updateChannelBannerImage: (payload: {
    media_id: string
    media_file_name: string
    media_url: string
  }) => {
    return MediaSchema.findByIdAndUpdate(
      { _id: payload.media_id },
      {
        media_file_name: payload.media_file_name,
        media_url: payload.media_url
      },
      { new: true }
    ).select({ media_url: 1 })
  },

  updateChannelDetail: (
    channel_id: string,
    payload: Partial<IChannel>,
    session: ClientSession
  ) => {
    for (const key in payload) {
      if (!(payload as any)[key]) {
        delete (payload as any)[key]
      }
    }

    return ChannelSchema.findByIdAndUpdate(
      { _id: channel_id },
      { ...payload },
      { session, new: true }
    )
  }
}
