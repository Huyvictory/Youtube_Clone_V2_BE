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
  reset_code: string
  reset_code_attempts: number
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
  Dob?: Date
  channel_id: ObjectId
  subscribed_channels: ObjectId[]
  user_media_id: ObjectId[]
  verified: boolean
  verifications?: ObjectId[]
  resetPasswords?: ObjectId[]
}

export interface IUserMethods {
  comparePassword: (password: string) => boolean
}

export type UserModel = Model<IUser, unknown, IUserMethods>

export type VerificationRequestPayload = Pick<IUser, 'email'>

export type UpdateProfilePayload = Required<
  Pick<IUser, 'firstname' | 'lastname'>
>

export type UpdateEmailPayload = Pick<IUser, 'email' | 'password'>

export interface UpdatePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface DeleteProfilePayload {
  password: string
}
