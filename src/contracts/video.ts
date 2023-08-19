import { Model, ObjectId } from 'mongoose'

export interface IVideo {
  channel_id: ObjectId
  video_title: string
  video_thumbnail_media_id: ObjectId
  video_description: string
  video_category_id: ObjectId
  video_commments: ObjectId[]
  video_total_comments: number
  video_like_count: ObjectId[]
  video_dislike_count: ObjectId[]
  video_views: number
  video_file_name: string
  video_url: string
  video_playlists: ObjectId[]
  user_id: ObjectId
  createdAt?: string
  updatedAt?: string
}

export type CreateVideoPayload = {
  channel_id: ObjectId
  video_title: string
  video_thumbnail_media_id: ObjectId
  video_category_id: ObjectId
  video_file_name: string
  video_url: string
  user_id: ObjectId
  video_description?: string
}

export type VideoModel = Model<IVideo>
