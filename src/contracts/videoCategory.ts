import { Model } from 'mongoose'

export interface IVideoCategory {
  video_category_name: string
}

export type VideoCategoryModel = Model<IVideoCategory>
