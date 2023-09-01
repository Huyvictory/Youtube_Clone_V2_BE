import { Model, ObjectId } from 'mongoose'

export interface IPlaylist {
  playlist_name: string
  playlist_videos: ObjectId[]
  playlist_channel_id: ObjectId
  playlist_respresentation_image_id: ObjectId
  playlist_description: string
  playlist_user_id: ObjectId
}

export type createPlaylistPayload = {
  playlist_name: string
  playlist_channel_id: ObjectId
  playlist_description?: string
  playlist_user_id: ObjectId
}

export type PlaylistModel = Model<IPlaylist>
