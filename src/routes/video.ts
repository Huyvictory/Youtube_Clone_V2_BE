import { Router } from 'express'

import { authGuard } from '@/guards'
import { videoValidation } from '@/validations'
import { videoController } from '@/controllers'

export const video = (router: Router): void => {
  router.post(
    '/video/create/video-categories',
    authGuard.isAuth,
    videoValidation.createVideoCategoryValidation,
    videoController.createVideoCategory
  )
}
