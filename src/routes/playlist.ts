import { Router } from 'express'

import { authGuard } from '@/guards'
import { playlistValidation } from '@/validations/playlistValidation'
import { playlistController } from '@/controllers/playlistController'
import { uploadSingleMediaMiddleware } from '@/middlewares'
import { saveMediaFileFirebase } from '@/middlewares/saveMediaFileMiddlewareFirebase'

export const playlist = (router: Router): void => {
  router.post(
    '/playlist/create',
    authGuard.isAuth,
    playlistValidation.createPlaylistValidation,
    playlistController.createPlaylist
  )

  router.get(
    '/playlist/detail/:playlistId',
    authGuard.isAuth,
    playlistController.getPlaylistDetail
  )

  router.get(
    '/playlist/list/:channelId',
    authGuard.isAuth,
    playlistController.getListPlaylists_UserChannel
  )

  router.put(
    '/playlist/update/information/:playlistId',
    authGuard.isAuth,
    playlistValidation.updateNameOrDescription,
    playlistController.updateNameOrDescription_Playlist
  )

  router.post(
    '/playlist/update/representation-image/:playlistId',
    authGuard.isAuth,
    playlistValidation.isPlaylistExists,
    uploadSingleMediaMiddleware,
    saveMediaFileFirebase,
    playlistController.createOrupdateRepresentationImage_Playlist
  )

  router.patch(
    '/playlist/update/video/:playlistId',
    authGuard.isAuth,
    playlistValidation.isPlaylistExists,
    playlistValidation.updateVideoPlaylistValidation,
    playlistController.addOrDeleteVideoPlaylist
  )

  router.delete(
    '/playlist/delete/:playlistId',
    authGuard.isAuth,
    playlistValidation.isPlaylistExists,
    playlistController.deletePlaylist
  )
}
