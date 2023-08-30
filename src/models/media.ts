import { Schema, model } from 'mongoose'

import { IMedia, MediaModel } from '@/contracts/media'

const schema = new Schema<IMedia, MediaModel>(
  {
    media_type: {
      type: String,
      enum: ['USER_PROFILE', 'CHANNEL_BANNER', 'VIDEO_THUMBNAIL', 'PLAYLIST'],
      required: true
    },
    media_file_name: {
      type: String,
      required: true
    },
    media_url: {
      type: String,
      required: true
    },
    media_user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  { timestamps: true }
)

export const MediaSchema = model<IMedia, MediaModel>('Media', schema)
