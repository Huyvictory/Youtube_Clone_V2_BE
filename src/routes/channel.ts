import { Router } from 'express'

import { authGuard } from '@/guards'
import { channelController } from '@/controllers/channelController'

export const channel = (router: Router): void => {
  router.get(
    '/channel/details',
    authGuard.isAuth,
    channelController.getChannelDetails
  )
}
