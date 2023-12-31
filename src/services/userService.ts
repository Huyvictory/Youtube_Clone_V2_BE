import { ClientSession, ObjectId } from 'mongoose'

import { UserSchema } from '@/models'
import { UpdateProfilePayload } from '@/contracts/user'

export const userService = {
  create: (
    {
      email,
      password,
      firstname,
      lastname,
      Dob,
      sex
    }: {
      email: string
      password: string
      firstname: string
      lastname: string
      Dob: Date | null
      sex: string | null
    },
    session?: ClientSession
  ) => {
    const username = `${firstname}${lastname}`.toLowerCase()
    return new UserSchema({
      email,
      password,
      firstname,
      lastname,
      username,
      Dob,
      sex
    }).save({ session })
  },

  getById: (userId: ObjectId) => UserSchema.findById(userId),

  getByEmail: (email: string) => UserSchema.findOne({ email }),

  isExistByEmail: (email: string) => UserSchema.exists({ email }),

  updatePasswordByUserId: (
    userId: ObjectId,
    newPassword: string,
    session?: ClientSession
  ) => {
    const data = [
      { _id: userId },
      { password: newPassword, resetPasswords: [] }
    ]

    let params = null

    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }

    return UserSchema.updateOne(...params)
  },

  updateVerificationAndEmailByUserId: (
    userId: ObjectId,
    email: string,
    session?: ClientSession
  ) => {
    const data = [{ _id: userId }, { email, verified: true, verifications: [] }]

    let params = null

    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }

    return UserSchema.updateOne(...params)
  },

  updateProfileByUserId: (
    userId: ObjectId,
    payloadToUpdate: UpdateProfilePayload,
    session?: ClientSession
  ) => {
    const newPayloadToUpdate = { ...payloadToUpdate }

    for (const [key, value] of Object.entries(payloadToUpdate)) {
      if (!value) {
        delete (newPayloadToUpdate as Record<string, unknown>)[key]
      }
    }

    const data = [{ _id: userId }, { ...newPayloadToUpdate }]

    let params = null

    if (session) {
      params = [...data, { session, new: true }]
    } else {
      params = [...data, { new: true }]
    }

    return UserSchema.findOneAndUpdate(...params)
  },

  updateUserAvatar: (
    userId: ObjectId,
    user_avatar_media_id: ObjectId,
    session?: ClientSession
  ) => {
    const data = [{ _id: userId }, { user_avatar_media_id }]

    let params = null

    if (session) {
      params = [...data, { session, new: true }]
    } else {
      params = [...data, { new: true }]
    }

    return UserSchema.findOneAndUpdate(...params)
  },

  updateEmailByUserId: (
    userId: ObjectId,
    email: string,
    session?: ClientSession
  ) => {
    const data = [{ _id: userId }, { email, verified: false }]

    let params = null

    if (session) {
      params = [...data, { session }]
    } else {
      params = data
    }

    return UserSchema.updateOne(...params)
  },

  deleteById: (userId: ObjectId, session?: ClientSession) =>
    UserSchema.deleteOne({ user: userId }, { session }),

  addResetPasswordRequestToUser: async (
    {
      userId,
      resetPasswordId
    }: {
      userId: ObjectId
      resetPasswordId: ObjectId
    },
    session?: ClientSession
  ) => {
    let options = {}

    if (session) {
      options = { session }
    }

    const user = await UserSchema.findOne({ _id: userId }, null, options)

    if (user) {
      if (!user.resetPasswords) {
        user.resetPasswords = []
      }
      user.resetPasswords.push(resetPasswordId)
      await user.save({ session })
    }
  },

  addChannel_VerificationToUser: async (
    {
      userId,
      verificationId,
      channelId
    }: {
      userId: ObjectId
      verificationId: ObjectId
      channelId?: ObjectId
    },
    session?: ClientSession
  ) => {
    let options = {}

    if (session) {
      options = { session }
    }

    const user = await UserSchema.findOne({ _id: userId }, null, options)

    if (user) {
      if (!user.verifications) {
        user.verifications = []
      }
      user.verifications.push(verificationId)
      if (channelId) {
        user.channel_id = channelId
      }
      await user.save({ session })
    }
  }
}
