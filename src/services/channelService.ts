import { ClientSession, ObjectId } from 'mongoose'
import { ChannelSchema } from '@/models'

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
  }
}
