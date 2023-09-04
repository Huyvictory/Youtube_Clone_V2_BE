import { createPlaylistPayload } from '@/contracts/playlist'
import { MediaSchema, PlaylistSchema } from '@/models'
import mongoose, { ClientSession } from 'mongoose'

export const playlistService = {
  createPlaylist: (payload: createPlaylistPayload) => {
    return new PlaylistSchema({
      playlist_name: payload.playlist_name,
      playlist_description: payload.playlist_description ?? null,
      playlist_channel_id: payload.playlist_channel_id,
      playlist_user_id: payload.playlist_user_id
    }).save()
  },
  getPlaylistDetail: (payload: { playlist_id: string }) => {
    return PlaylistSchema.findById({ _id: payload.playlist_id })
  },
  getListPlaylists_UserChannel: (payload: { channel_id: string }) => {
    return PlaylistSchema.find({ playlist_channel_id: payload.channel_id })
  },
  updateInformation_Playlist: (
    payload: {
      playlist_name?: string
      playlist_description?: string
      playlist_respresentation_image_id?: string
    },
    playlist_id: string,
    session?: ClientSession
  ) => {
    if (session) {
      return PlaylistSchema.updateOne(
        { _id: playlist_id },
        { ...payload },
        { session, new: true }
      )
    }
    return PlaylistSchema.updateOne(
      { _id: playlist_id },
      { ...payload },
      { new: true }
    )
  },
  createOrUpdateRepresentationImage_Playlist: (
    payload: {
      media_type: string
      media_file_name: string
      media_url: string
      media_user_id: string
    },
    session: ClientSession,
    playlist_respresentation_image_id: string | null
  ) => {
    if (playlist_respresentation_image_id) {
      return MediaSchema.findOneAndUpdate(
        { _id: playlist_respresentation_image_id },
        {
          media_file_name: payload.media_file_name,
          media_url: payload.media_url
        },
        { session, new: true }
      )
    }

    return new MediaSchema({ ...payload }).save({ session })
  },
  addOrDeleteVideoPlaylist: async (
    payload: { videoId: string },
    playlistId: string
  ) => {
    const playlistDetail = await PlaylistSchema.findById({ _id: playlistId })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videoIDObjectId: any = new mongoose.Types.ObjectId(payload.videoId)

    if (!playlistDetail?.playlist_videos.includes(videoIDObjectId)) {
      playlistDetail?.playlist_videos.push(videoIDObjectId)
    } else {
      playlistDetail.playlist_videos = playlistDetail.playlist_videos.filter(
        videoId => String(videoId) !== String(videoIDObjectId)
      )

      return await PlaylistSchema.findOneAndUpdate(
        { _id: playlistId },
        { $set: { playlist_videos: [...playlistDetail.playlist_videos] } }
      )
    }

    return await playlistDetail?.save()
  },
  deletePlaylistById: (
    payload: { playlistId: string },
    session: ClientSession
  ) => {
    return PlaylistSchema.findOneAndDelete(
      { _id: payload.playlistId },
      { session }
    )
  }
}
