import { Router } from 'express'

import { authGuard } from '@/guards'
import { mediaController, videoController } from '@/controllers'
import { uploadSingleMediaMiddleware } from '@/middlewares'
import { saveMediaFileFirebase } from '@/middlewares/saveMediaFileMiddlewareFirebase'
import { uploadMultipleMediasMiddleware } from '@/middlewares/uploadMultipleMediasMiddleware'
import { saveMediaFilesVideoFirebase } from '@/middlewares/saveMediaFIlesVideoFirebase'

export const media = (router: Router): void => {
  router.put(
    '/update/user/avatar_profile',
    authGuard.isAuth,
    uploadSingleMediaMiddleware,
    saveMediaFileFirebase,
    mediaController.updateOrCreate_UserAvatar
  )

  router.post(
    '/media/video-create',
    authGuard.isAuth,
    uploadMultipleMediasMiddleware,
    saveMediaFilesVideoFirebase,
    videoController.createVideo
  )
}
