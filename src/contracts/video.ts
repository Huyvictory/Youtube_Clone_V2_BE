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
}

export type CreateVideoPayload = Pick<
  IVideo,
  | 'channel_id'
  | 'video_title'
  | 'video_thumbnail_media_id'
  | 'video_category_id'
  | 'video_file_name'
  | 'video_url'
>

export type VideoModel = Model<IVideo>
