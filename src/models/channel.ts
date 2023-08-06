import { ChannelModel, IChannel } from '@/contracts/channel'
import { Schema, model } from 'mongoose'

const schema = new Schema<IChannel, ChannelModel>(
  {
    channel_name: {
      type: String,
      required: true
    },
    channel_playlist: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
      default: []
    },
    channel_videos: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
      default: []
    },
    channel_subscribers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: []
    },
    channel_owner_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    channel_description_id: {
      type: Schema.Types.ObjectId,
      ref: 'ChannelDescription',
      default: null
    },
    channel_banner_media_id: {
      type: Schema.Types.ObjectId,
      ref: 'Media'
    }
  },
  { timestamps: true }
)

export const ChannelSchema = model<IChannel, ChannelModel>('Channel', schema)
