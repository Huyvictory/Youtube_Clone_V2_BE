import { Router } from 'express'

import { authGuard } from '@/guards'
import { playlistValidation } from '@/validations/playlistValidation'
import { playlistController } from '@/controllers/playlistController'

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
}
