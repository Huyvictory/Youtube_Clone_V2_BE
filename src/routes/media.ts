import { Router } from 'express'

import { authGuard } from '@/guards'
import { mediaController } from '@/controllers'
import { uploadSingleMediaMiddleware } from '@/middlewares'
import { saveMediaFileFirebase } from '@/middlewares/saveMediaFileMiddlewareFirebase'

export const media = (router: Router): void => {
  router.put(
    '/update/user/avatar_profile',
    authGuard.isAuth,
    uploadSingleMediaMiddleware,
    saveMediaFileFirebase,
    mediaController.updateOrCreate_UserAvatar
  )
}
