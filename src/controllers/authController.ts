import { Response } from 'express'
import { startSession } from 'mongoose'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import winston from 'winston'

import { ExpiresInMinutes } from '@/constants'
import {
  NewPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload
} from '@/contracts/auth'
import {
  resetPasswordService,
  verificationService,
  userService
} from '@/services'
import { jwtSign } from '@/utils/jwt'
import {
  IBodyRequest,
  ICombinedRequest,
  IContextRequest,
  IParamsRequest,
  IUserRequest
} from '@/contracts/request'
import { createCryptoString } from '@/utils/cryptoString'
import { addMinutesFromNow } from '@/utils/dates'
import { UserMail } from '@/mailer'
import { createHash } from '@/utils/hash'
import { redis } from '@/dataSources'
import { channelService } from '@/services/channelService'
import { VerificationRequestPayload } from '@/contracts/user'
import { isVerifyTokenExpired } from '@/utils/verification'

export const authController = {
  signIn: async (
    { body: { email, password } }: IBodyRequest<SignInPayload>,
    res: Response
  ) => {
    try {
      const user = await userService.getByEmail(email)

      const comparePassword = user?.comparePassword(password)

      if (!user || !comparePassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Email or password is incorrect',
          status: StatusCodes.BAD_REQUEST
        })
      }

      if (!user.verified) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            'You need to verified your email to continue using our platform',
          isVerfied: false,
          status: StatusCodes.UNAUTHORIZED
        })
      }

      const { accessToken } = jwtSign(user.id)

      return res.status(StatusCodes.OK).json({
        data: { accessToken },
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  signUp: async (
    {
      body: { email, password, firstname, lastname }
    }: IBodyRequest<SignUpPayload>,
    res: Response
  ) => {
    const session = await startSession()
    try {
      const isUserExist = await userService.isExistByEmail(email)

      if (isUserExist) {
        return res.status(StatusCodes.CONFLICT).json({
          message: 'Email is already registered !',
          status: StatusCodes.CONFLICT
        })
      }

      session.startTransaction()
      const hashedPassword = await createHash(password)

      const user = await userService.create(
        {
          email,
          password: hashedPassword,
          firstname,
          lastname
        },
        session
      )

      const user_channel = await channelService.createChannel(
        {
          channel_name: user.username,
          channel_owner_id: user.id
        },
        session
      )

      const cryptoString = createCryptoString()

      const verificationTokenExpireTime = addMinutesFromNow(
        ExpiresInMinutes.Verification
      )

      const verification = await verificationService.createVerification(
        {
          userId: user.id,
          email,
          verification_token: cryptoString,
          expiresIn: verificationTokenExpireTime
        },
        session
      )

      await userService.addChannel_VerificationToUser(
        {
          userId: user.id,
          verificationId: verification.id,
          channelId: user_channel[0].id
        },
        session
      )

      const userMail = new UserMail()

      userMail.verification({
        email: user.email,
        accessToken: cryptoString
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: 'Registered account successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      console.log(error)
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  signOut: async (
    { context: { user, accessToken } }: IContextRequest<IUserRequest>,
    res: Response
  ) => {
    try {
      await redis.client.set(`expiredToken:${accessToken}`, `${user.id}`, {
        EX: process.env.REDIS_TOKEN_EXPIRATION,
        NX: true
      })

      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  resetPassword: async (
    { body: { email } }: IBodyRequest<ResetPasswordPayload>,
    res: Response
  ) => {
    const session = await startSession()

    try {
      const user = await userService.getByEmail(email)

      if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message:
            'Your email was not found in our system, please try with a different one',
          status: StatusCodes.BAD_REQUEST
        })
      }

      session.startTransaction()

      const cryptoString = createCryptoString()

      const dateFromNow = addMinutesFromNow(ExpiresInMinutes.Verification)

      const resetPassword = await resetPasswordService.create(
        {
          userId: user.id,
          accessToken: cryptoString,
          expiresIn: dateFromNow
        },
        session
      )

      await userService.addResetPasswordToUser(
        {
          userId: user.id,
          resetPasswordId: resetPassword.id
        },
        session
      )

      const userMail = new UserMail()

      userMail.resetPassword({
        email: user.email,
        accessToken: cryptoString
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  newPassword: async (
    {
      body: { password },
      params
    }: ICombinedRequest<null, NewPasswordPayload, { accessToken: string }>,
    res: Response
  ) => {
    const session = await startSession()
    try {
      const resetPassword = await resetPasswordService.getByValidAccessToken(
        params.accessToken
      )

      if (!resetPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Your request to reset password was invalid !',
          status: StatusCodes.BAD_REQUEST
        })
      }

      const user = await userService.getById(resetPassword.user_id)

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: ReasonPhrases.NOT_FOUND,
          status: StatusCodes.NOT_FOUND
        })
      }

      session.startTransaction()
      const hashedPassword = await createHash(password)

      await userService.updatePasswordByUserId(
        resetPassword.user_id,
        hashedPassword,
        session
      )

      await resetPasswordService.deleteManyByUserId(user.id, session)

      const { accessToken } = jwtSign(user.id)

      const userMail = new UserMail()

      userMail.successfullyUpdatedPassword({
        email: user.email
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        data: { accessToken },
        message: 'Password reset sucessfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },
  verificationRequest: async (
    { body: { email } }: IBodyRequest<VerificationRequestPayload>,
    res: Response
  ) => {
    const session = await startSession()

    try {
      const user = await userService.getByEmail(email)

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'User not found',
          status: StatusCodes.NOT_FOUND
        })
      }

      if (user.verified) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Email is already verified',
          status: StatusCodes.BAD_REQUEST
        })
      }

      session.startTransaction()
      const cryptoString = createCryptoString()

      const verificationTokenExpireTime = addMinutesFromNow(
        ExpiresInMinutes.Verification
      )

      const verification = await verificationService.createVerification(
        {
          userId: user.id,
          email,
          verification_token: cryptoString,
          expiresIn: verificationTokenExpireTime
        },
        session
      )

      await userService.addChannel_VerificationToUser(
        {
          userId: user.id,
          verificationId: verification.id
        },
        session
      )

      const userMail = new UserMail()

      userMail.verification({
        email: user.email,
        accessToken: cryptoString
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: 'Request email verification sent',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  verification: async (
    { params }: IParamsRequest<{ verifyToken: string }>,
    res: Response
  ) => {
    const session = await startSession()
    try {
      const verification = await verificationService.getByValidVerifyToken(
        params.verifyToken
      )

      if (!verification) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: 'Error in verifying your email please try again !',
          status: StatusCodes.FORBIDDEN
        })
      }

      if (isVerifyTokenExpired(verification.verification_expiresIn)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message:
            'Verify token is expired. Please send a new verification request',
          isVerifyTokenExpired: true,
          status: StatusCodes.FORBIDDEN
        })
      }
      session.startTransaction()

      await userService.updateVerificationAndEmailByUserId(
        verification.user_id,
        verification.email,
        session
      )

      await verificationService.deleteManyByUserId(
        verification.user_id,
        session
      )

      const { accessToken } = jwtSign(verification.user_id)

      const userMail = new UserMail()

      userMail.successfullyVerified({
        email: verification.email
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        data: { accessToken },
        message: 'Verify email successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
