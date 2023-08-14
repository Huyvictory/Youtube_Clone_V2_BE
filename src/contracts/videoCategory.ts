import { Model } from 'mongoose'

export interface IVideoCategory {
  video_category_name: string
}

export type CreateVideoCategoryPayload = {
  video_category_names: { video_category_name: string }[]
}

export type VideoCategoryModel = Model<IVideoCategory>
