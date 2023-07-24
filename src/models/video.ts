import { IVideo, VideoModel } from '@/contracts/video'
import { Schema, model } from 'mongoose'

const schema = new Schema<IVideo, VideoModel>(
  {
    channel_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Channel'
    },
    video_title: {
      type: String,
      required: true
    },
    video_thumbnail_media_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Media'
    },
    video_description: {
      type: String
    },
    video_category_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'VideoCategory'
    },
    video_commments: {
      type: [{ type: Schema.Types.ObjectId }],
      ref: 'Comment',
      default: []
    },
    video_total_comments: {
      type: Number,
      default: 0
    },
    video_like_count: {
      type: [{ type: Schema.Types.ObjectId }],
      ref: 'User',
      default: []
    },
    video_dislike_count: {
      type: [{ type: Schema.Types.ObjectId }],
      ref: 'User',
      default: []
    },
    video_views: {
      type: Number,
      default: 0
    },
    video_file_name: {
      type: String,
      required: true
    },
    video_url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const VideoSchema = model<IVideo, VideoModel>('Video', schema)
