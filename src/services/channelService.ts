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
    )
}
