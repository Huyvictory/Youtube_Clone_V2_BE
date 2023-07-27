import { ClientSession, ObjectId } from 'mongoose'

import { ResetPasswordSchema } from '@/models'
import { createDateNow } from '@/utils/dates'

export const resetPasswordService = {
  create: (
    {
      userId,
      accessToken,
      expiresIn
    }: {
      userId: ObjectId
      accessToken: string
      expiresIn: Date
    },
    session?: ClientSession
  ) =>
    new ResetPasswordSchema({
      user: userId,
      accessToken,
      expiresIn
    }).save({ session }),

  getByValidAccessToken: (accessToken: string) =>
    ResetPasswordSchema.findOne({
      accessToken,
      expiresIn: { $gte: createDateNow() }
    }),

  deleteManyByUserId: (userId: ObjectId, session?: ClientSession) =>
    ResetPasswordSchema.deleteMany({ user: userId }, { session })
}
