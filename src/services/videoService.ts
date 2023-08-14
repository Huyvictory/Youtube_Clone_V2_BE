import { VideoCategorySchema } from '@/models'

export const videoService = {
  isVideoCategoryExists: (video_category_name: string) => {
    return VideoCategorySchema.findOne({ video_category_name })
  },

  createManyVideoCategories: (
    video_category_names: Array<{ video_category_name: string }>
  ) => {
    return VideoCategorySchema.insertMany(video_category_names)
  }
}
