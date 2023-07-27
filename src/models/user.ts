import { Schema, model } from 'mongoose'
import { compareSync } from 'bcrypt'

import { IUser, IUserMethods, UserModel } from '@/contracts/user'

const schema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    Dob: {
      type: Date,
      default: undefined
    },
    channel_id: {
      type: Schema.Types.ObjectId
    },
    subscribed_channels: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
      default: []
    },
    user_media_id: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
      default: []
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifications: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Verification' }],
      default: []
    },
    resetPasswords: {
      type: [{ type: Schema.Types.ObjectId, ref: 'ResetPassword' }],
      default: []
    }
  },
  { timestamps: true }
)

schema.methods.comparePassword = function (password: string) {
  return compareSync(password, this.password)
}

schema.methods.toJSON = function () {
  const obj = this.toObject()

  delete obj.password
  delete obj.verifications
  delete obj.resetPasswords

  return obj
}

export const UserSchema = model<IUser, UserModel>('User', schema)
