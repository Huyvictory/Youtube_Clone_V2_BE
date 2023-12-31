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

  getVideoCategories: () => {
    return VideoCategorySchema.find()
  },

  createNewVideo: (payload: CreateVideoPayload, session: ClientSession) => {
    return new VideoSchema({
      channel_id: payload.channel_id,
      video_title: payload.video_title,
      video_thumbnail_media_id: payload.video_thumbnail_media_id,
      video_category_id: payload.video_category_id,
      video_file_name: payload.video_file_name,
      video_url: payload.video_url,
      video_description: payload.video_description ?? null,
      user_id: payload.user_id
    }).save({ session })
  },

  getVideoById: (videoId: string) => {
    return VideoSchema.findById({ _id: videoId })
  },

  getListVideos: ({
    page,
    limit,
    videoCategory,
    channelId
  }: {
    page: number
    limit: number
    videoCategory?: Array<string> | string
    channelId?: string
  }) => {
    let queryStringsObject = {}

    if (videoCategory) {
      queryStringsObject = {
        ...queryStringsObject,
        video_category_id: { $in: videoCategory }
      }
    }

    if (channelId) {
      queryStringsObject = { ...queryStringsObject, channel_id: channelId }
    }

    if (Object.keys(queryStringsObject).length) {
      return VideoSchema.find({ ...queryStringsObject })
        .skip((page - 1) * limit)
        .limit(limit)
    }

    return VideoSchema.find()
      .skip((page - 1) * limit)
      .limit(limit)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateVideoById: (videoId: string, payload: any, session: ClientSession) => {
    return VideoSchema.findByIdAndUpdate(
      { _id: videoId },
      { ...payload },
      { session }
    )
  },

  deleteVideoById: (videoId: string, session: ClientSession) => {
    return VideoSchema.deleteOne({ _id: videoId }, { session })
  },

  updatePlaylistVideos: (deletedPlaylistId: string, session: ClientSession) => {
    return VideoSchema.updateMany(
      {
        video_playlists: { $elemMatch: { $eq: deletedPlaylistId } }
      },
      {
        $pull: {
          video_playlists: deletedPlaylistId
        }
      },
      { session }
    )
  },

  getWatchedVideosOfUser: (ids_watched_videos: Array<string>) => {
    return VideoSchema.find({ _id: { $in: ids_watched_videos } })
  }
}
