import { Model, ObjectId } from 'mongoose'

export interface IVerification {
  email: string
  verification_token: string
  verification_expiresIn: Date
  user_id: ObjectId
}

export interface IResetPassword {
  user_id: ObjectId
  reset_password_token: string
  reset_password_code: string
  reset_password_code_attempts: number
  is_disabled: boolean
  is_correct_reset_code: boolean
  resetpassword_expires_in: Date
}

export interface IUser {
  id: ObjectId
  email: string
  password: string
  firstname: string
  lastname: string
  username: string
  Dob: Date | null
  sex: string | null
  channel_id: ObjectId
  subscribed_channels: ObjectId[]
  user_avatar_media_id: ObjectId
  verified: boolean
  verifications?: ObjectId[]
  resetPasswords?: ObjectId[]
}

export interface IUserMethods {
  comparePassword: (password: string) => boolean
}

export interface IResetPasswordMethods {
  updateResetCodeAttempts: (incorrectResetCode: boolean) => void
}

export type UserModel = Model<IUser, unknown, IUserMethods>
export type ResetPasswordModel = Model<
  IResetPassword,
  unknown,
  IResetPasswordMethods
>

export type VerificationRequestPayload = Pick<IUser, 'email'>

export type UpdateProfilePayload = Pick<
  IUser,
  'firstname' | 'lastname' | 'username' | 'Dob' | 'sex'
>

export type UpdateEmailPayload = Pick<IUser, 'email' | 'password'>

export interface UpdatePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface DeleteProfilePayload {
  password: string
}
