import { Router } from 'express'

import { authGuard } from '@/guards'
import { userController } from '@/controllers'
import { userValidation } from '@/validations'

export const users = (router: Router): void => {
  router.get('/user/me', authGuard.isAuth, userController.me)

  router.put(
    '/user/update-profile',
    authGuard.isAuth,
    userController.updateUserProfile
  )

  router.post(
    '/user/update/email',
    authGuard.isAuth,
    userValidation.updateEmail,
    userController.updateEmail
  )

  router.put(
    '/user/update/password',
    authGuard.isAuth,
    userValidation.updatePassword,
    userController.updatePassword
  )

  router.get(
    '/user/subscribed-channels/:channelId',
    authGuard.isAuth,
    userController.getListChannelsSubscribed
  )
}
