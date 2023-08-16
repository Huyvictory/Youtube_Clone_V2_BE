import { Router } from 'express'

import { authGuard } from '@/guards'
import { videoValidation } from '@/validations'
import { videoController } from '@/controllers'
import { uploadMultipleMediasMiddleware } from '@/middlewares/uploadMultipleMediasMiddleware'
import { saveMediaFilesVideoFirebase } from '@/middlewares/saveMediaFIlesVideoFirebase'

export const video = (router: Router): void => {
  router.post(
    '/video/create/video-categories',
    authGuard.isAuth,
    videoValidation.createVideoCategoryValidation,
    videoController.createVideoCategory
  )

  router.get(
    '/video/getVideoDetail/:videoId',
    authGuard.isAuth,
    videoController.getVideoDetailById
  )

  router.put(
    '/video/updateVideoDetail/:videoId',
    authGuard.isAuth,
    uploadMultipleMediasMiddleware,
    saveMediaFilesVideoFirebase,
    videoController.updateVideoDetailById
  )
}
