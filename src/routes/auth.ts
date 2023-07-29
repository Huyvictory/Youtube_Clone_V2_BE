import { Router } from 'express'

import { authController } from '@/controllers'
import { authGuard } from '@/guards'
import { authValidation } from '@/validations'

export const auth = (router: Router): void => {
  router.post('/auth/sign-in', authValidation.signIn, authController.signIn)

  router.post('/auth/sign-up', authValidation.signUp, authController.signUp)

  router.get('/auth/sign-out', authGuard.isAuth, authController.signOut)

  router.post(
    '/auth/password/request-reset',
    authValidation.resetPassword,
    authController.resetPassswordRequest
  )

  router.put(
    '/auth/password/check-reset-password-code/:resetPasswordToken',
    authValidation.resetPasswordCodeValidation,
    authController.validateResetPasswordCode
  )

  router.post(
    '/auth/password/new/:resetPasswordToken',
    authValidation.newPassword,
    authController.resetNewPassword
  )

  router.post('/auth/verification/request', authController.verificationRequest)
  router.post('/auth/verification/:verifyToken', authController.verification)
}
