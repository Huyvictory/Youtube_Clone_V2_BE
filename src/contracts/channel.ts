import { Model, ObjectId } from 'mongoose'

export interface IChannel {
  channel_name: string
  channel_playlist?: ObjectId[]
  channel_videos?: ObjectId[]
  channel_subscribers?: ObjectId[]
  channel_owner_id: ObjectId
  channel_description_id?: ObjectId
}

export type ChannelModel = Model<IChannel>
