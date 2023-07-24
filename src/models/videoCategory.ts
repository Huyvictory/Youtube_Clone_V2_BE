import { IVideoCategory, VideoCategoryModel } from '@/contracts/videoCategory'
import { Schema, model } from 'mongoose'

const schema = new Schema<IVideoCategory, VideoCategoryModel>(
  {
    video_category_name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const VideoCategorySchema = model<IVideoCategory, VideoCategoryModel>(
  'VideoCategory',
  schema
)
