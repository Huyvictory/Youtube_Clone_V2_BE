import { Model, ObjectId } from 'mongoose'

export interface IPlaylist {
  playlist_name: string
  playlist_videos: ObjectId[]
  playlist_channel_id: ObjectId
  playlist_description: string
}

export type PlaylistModel = Model<IPlaylist>
