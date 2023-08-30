import { Model, ObjectId } from 'mongoose'

export interface IPlaylist {
  playlist_name: string
  playlist_videos: ObjectId[]
  playlist_channel_id: ObjectId
  playlist_description: string
  playlist_user_id: ObjectId
}

export type PlaylistModel = Model<IPlaylist>
