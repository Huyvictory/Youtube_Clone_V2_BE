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

schema.methods.toJSON = function () {
  const obj = this.toObject()

  const resObj = {
    ...obj
  }

  delete resObj.createdAt
  delete resObj.updatedAt
  delete resObj.__v

  return resObj
}

export const VideoCategorySchema = model<IVideoCategory, VideoCategoryModel>(
  'VideoCategory',
  schema
)
