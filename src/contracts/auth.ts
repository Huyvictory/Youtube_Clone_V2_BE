import { IUser, IResetPassword } from './user'

export type SignInPayload = Pick<IUser, 'email' | 'password'>

export type SignUpPayload = Pick<
  IUser,
  'email' | 'password' | 'firstname' | 'lastname'
>

export type ResetPasswordPayload = Pick<IUser, 'email'>

export type ResetNewPasswordPayload = {
  newPassword: string
  confirmNewPassword: string
}

export type ResetPasswordCodePayload = Pick<
  IResetPassword,
  'reset_password_code'
>
