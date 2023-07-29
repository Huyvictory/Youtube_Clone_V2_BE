import { Schema, model } from 'mongoose'

import {
  IResetPassword,
  IResetPasswordMethods,
  ResetPasswordModel
} from '@/contracts/user'

const schema = new Schema<
  IResetPassword,
  ResetPasswordModel,
  IResetPasswordMethods
>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reset_password_token: { type: String, required: true },
    reset_password_code: {
      type: String,
      required: true
    },
    reset_password_code_attempts: {
      type: Number,
      default: 0
    },
    is_disabled: {
      type: Boolean,
      default: false
    },
    is_correct_reset_code: {
      type: Boolean,
      default: false
    },
    resetpassword_expires_in: { type: Date, required: true }
  },
  { timestamps: true }
)

schema.methods.updateResetCodeAttempts = function (incorrectResetCode) {
  if (incorrectResetCode) {
    if (this.reset_password_code_attempts === 5) {
      this.is_disabled = true
      return
    }

    this.reset_password_code_attempts += 1
  } else {
    this.is_correct_reset_code = true
  }
}

schema.methods.toJSON = function () {
  const obj = this.toObject()

  delete obj.user_id
  delete obj.reset_password_code

  return obj
}

export const ResetPasswordSchema = model<IResetPassword, ResetPasswordModel>(
  'ResetPassword',
  schema
)
