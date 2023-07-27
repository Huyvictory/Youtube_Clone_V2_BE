import { ClientSession, ObjectId } from 'mongoose'

import { VerificationSchema } from '@/models'

export const verificationService = {
  createVerification: (
    {
      userId,
      email,
      verification_token,
      expiresIn
    }: {
      userId: ObjectId
      email: string
      verification_token: string
      expiresIn: Date
    },
    session?: ClientSession
  ) =>
    new VerificationSchema({
      user_id: userId,
      email,
      verification_token,
      verification_expiresIn: expiresIn
    }).save({ session }),

  findOneAndUpdateByUserIdAndEmail: (
    {
      userId,
      email,
      verification_token,
      expiresIn
    }: {
      userId: ObjectId
      email: string
      verification_token: string
      expiresIn: Date
    },
    session?: ClientSession
  ) => {
    const data = [
      { user: userId, email },
      {
        user: userId,
        email,
        verification_token,
        verification_expiresIn: expiresIn
      }
    ]

    let params = null

    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }

    return VerificationSchema.findOneAndUpdate(...params)
  },

  getByValidVerifyToken: (verificationToken: string) =>
    VerificationSchema.findOne({
      verification_token: verificationToken
    }),

  deleteManyByUserId: (userId: ObjectId, session?: ClientSession) =>
    VerificationSchema.deleteMany({ user: userId }, { session })
}
