import { ClientSession, ObjectId } from 'mongoose'

import { ResetPasswordSchema } from '@/models'
import { createDateNow } from '@/utils/dates'

export const resetPasswordService = {
  createResetPasswordRequest: (
    {
      userId,
      resetPasswordToken,
      resetCode,
      expiresIn
    }: {
      userId: ObjectId
      resetPasswordToken: string
      resetCode: string
      expiresIn: Date
    },
    session?: ClientSession
  ) =>
    new ResetPasswordSchema({
      user_id: userId,
      reset_password_token: resetPasswordToken,
      reset_password_code: resetCode,
      resetpassword_expires_in: expiresIn
    }).save({ session }),

  getByResetPasswordToken: (resetPasswordToken: string) =>
    ResetPasswordSchema.findOne({ reset_password_token: resetPasswordToken }),

  getByValidAccessToken: (accessToken: string) =>
    ResetPasswordSchema.findOne({
      accessToken,
      expiresIn: { $gte: createDateNow() }
    }),

  deleteManyByUserId: (userId: ObjectId, session?: ClientSession) =>
    ResetPasswordSchema.deleteMany({ user_id: userId }, { session })
}
