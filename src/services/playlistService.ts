import { createPlaylistPayload } from '@/contracts/playlist'
import { PlaylistSchema } from '@/models'

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
  }
}
