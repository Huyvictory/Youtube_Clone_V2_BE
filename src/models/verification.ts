import { Schema, model } from 'mongoose'

import { IVerification } from '@/contracts/user'

const schema = new Schema<IVerification>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    email: { type: String },
    verification_token: { type: String },
    verification_expiresIn: { type: Date }
  },
  { timestamps: true }
)

export const VerificationSchema = model<IVerification>('Verification', schema)
