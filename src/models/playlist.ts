import { IPlaylist, PlaylistModel } from '@/contracts/playlist'
import { Schema, model } from 'mongoose'

const schema = new Schema<IPlaylist, PlaylistModel>(
  {
    playlist_name: {
      type: String,
      required: true
    },
    playlist_videos: {
      type: [{ type: Schema.Types.ObjectId }],
      default: [],
      ref: 'Video'
    },
    playlist_channel_id: {
      type: Schema.Types.ObjectId,
      ref: 'Channel'
    },
    playlist_description: {
      type: String
    }
  },
  { timestamps: true }
)

export const PlaylistSchema = model<IPlaylist, PlaylistModel>(
  'Playlist',
  schema
)
