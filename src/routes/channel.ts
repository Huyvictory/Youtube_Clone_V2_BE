import { Router } from 'express'

import { authGuard } from '@/guards'
import { channelController } from '@/controllers/channelController'
import { uploadSingleMediaMiddleware } from '@/middlewares'
import { saveMediaFileFirebase } from '@/middlewares/saveMediaFileMiddlewareFirebase'

export const channel = (router: Router): void => {
  router.get(
    '/channel/details',
    authGuard.isAuth,
    channelController.getChannelDetails
  )

  router.post(
    '/channel/banner',
    authGuard.isAuth,
    uploadSingleMediaMiddleware,
    saveMediaFileFirebase,
    channelController.updateOrCreate_ChannelBanner
  )
}
