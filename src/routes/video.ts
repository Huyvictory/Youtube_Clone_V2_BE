import { Router } from 'express'

import { authGuard } from '@/guards'
import { videoValidation } from '@/validations'
import { videoController } from '@/controllers'
import { uploadMultipleMediasMiddleware } from '@/middlewares/uploadMultipleMediasMiddleware'
import { saveMediaFilesVideoFirebase } from '@/middlewares/saveMediaFIlesVideoFirebase'

export const video = (router: Router): void => {
  router.post(
    '/video-category/create',
    authGuard.isAuth,
    videoValidation.createVideoCategoryValidation,
    videoController.createVideoCategory
  )

  router.get(
    '/video-category/getVideoCategories',
    authGuard.isAuth,
    videoController.getListVideoCategories
  )

  router.post(
    '/video/create',
    authGuard.isAuth,
    uploadMultipleMediasMiddleware,
    saveMediaFilesVideoFirebase,
    videoController.createVideo
  )

  router.get(
    '/video/getVideoDetail/:videoId',
    authGuard.isAuth,
    videoController.getVideoDetailById
  )

  router.get(
    '/video/getPlaylistsVideo/:videoId',
    authGuard.isAuth,
    videoController.getPlaylistsOfVideo
  )

  router.get(
    '/video/getVideosList',
    authGuard.isAuth,
    videoValidation.getListVideoValidation,
    videoController.getVideosList
  )

  router.put(
    '/video/updateVideoDetail/:videoId',
    authGuard.isAuth,
    uploadMultipleMediasMiddleware,
    saveMediaFilesVideoFirebase,
    videoController.updateVideoDetailById
  )

  router.delete(
    '/video/deleteVideoDetail/:videoId',
    authGuard.isAuth,
    videoController.deleteVideoById
  )

  router.patch(
    '/video/like/:videoId',
    authGuard.isAuth,
    videoValidation.userLikeUnlikeVideoValidation,
    videoController.userLikeVideoId
  )

  router.patch(
    '/video/unlike/:videoId',
    authGuard.isAuth,
    videoValidation.userLikeUnlikeVideoValidation,
    videoController.userUnlikeVideoId
  )

  router.post(
    '/video/watched-videos',
    authGuard.isAuth,
    videoController.getListWatchedVideosUser
  )
}
