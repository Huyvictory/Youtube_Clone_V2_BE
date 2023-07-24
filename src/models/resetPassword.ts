import { Schema, model } from 'mongoose'

import { IResetPassword } from '@/contracts/user'

const schema = new Schema<IResetPassword>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reset_password_token: { type: String },
    reset_code: {
      type: String
    },
    reset_code_attempts: {
      type: Number
    },
    is_disabled: {
      type: Boolean,
      default: false
    },
    is_correct_reset_code: {
      type: Boolean,
      default: false
    },
    resetpassword_expires_in: { type: Date }
  },
  { timestamps: true }
)

export const ResetPasswordSchema = model<IResetPassword>(
  'ResetPassword',
  schema
)
