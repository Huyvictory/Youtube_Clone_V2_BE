import { CreateVideoPayload } from '@/contracts/video'
import { VideoCategorySchema, VideoSchema } from '@/models'
import { ClientSession } from 'mongoose'

export const videoService = {
  isVideoCategoryExists: (video_category_name: string) => {
    return VideoCategorySchema.findOne({ video_category_name })
  },

  createManyVideoCategories: (
    video_category_names: Array<{ video_category_name: string }>
  ) => {
    return VideoCategorySchema.insertMany(video_category_names)
  },

  createNewVideo: (payload: CreateVideoPayload, session: ClientSession) => {
    return new VideoSchema({
      channel_id: payload.channel_id,
      video_title: payload.video_title,
      video_thumbnail_media_id: payload.video_thumbnail_media_id,
      video_category_id: payload.video_category_id,
      video_file_name: payload.video_file_name,
      video_url: payload.video_url
    }).save({ session })
  }
}
