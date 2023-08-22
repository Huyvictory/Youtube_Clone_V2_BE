import { Model, ObjectId } from 'mongoose'

export interface IChannel {
  channel_name: string
  channel_playlist: ObjectId[] | null
  channel_videos: ObjectId[] | null
  channel_subscribers: ObjectId[] | null
  channel_owner_id: ObjectId
  channel_description_id: ObjectId | null
  channel_banner_media_id: ObjectId | null
  subscribed_channels: ObjectId[]
}

export type ChannelModel = Model<IChannel>
