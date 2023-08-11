import { Router } from 'express'

import { authGuard } from '@/guards'
import { mediaController } from '@/controllers'
import { uploadSingleImageMiddleware } from '@/middlewares'
import { saveMediaFileFirebase } from '@/middlewares/saveMediaFileMiddlewareFirebase'

export const media = (router: Router): void => {
  router.post(
    '/media/image/upload',
    authGuard.isAuth,
    uploadSingleImageMiddleware,
    saveMediaFileFirebase,
    mediaController.imageUpload
  )
}
