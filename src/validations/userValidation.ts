import { NextFunction, Response } from 'express'
import { ObjectId } from 'mongoose'
import validator from 'validator'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import winston from 'winston'

import {
  IBodyRequest,
  ICombinedRequest,
  IUserRequest
} from '@/contracts/request'
import {
  DeleteProfilePayload,
  UpdateEmailPayload,
  UpdatePasswordPayload,
  VerificationRequestPayload
} from '@/contracts/user'
import { isValidPassword } from '@/utils/password'

export const userValidation = {
  verificationRequest: (
    req: IBodyRequest<VerificationRequestPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body.email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST
        })
      }

      let normalizedEmail =
        req.body.email && validator.normalizeEmail(req.body.email)
      if (normalizedEmail) {
        normalizedEmail = validator.trim(normalizedEmail)
      }

      if (
        !normalizedEmail ||
        !validator.isEmail(normalizedEmail, { allow_utf8_local_part: false })
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST
        })
      }

      Object.assign(req.body, { email: normalizedEmail })

      return next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  updateEmail: (
    req: IBodyRequest<UpdateEmailPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body.email || !req.body.password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST
        })
      }

      let normalizedEmail =
        req.body.email && validator.normalizeEmail(req.body.email)
      if (normalizedEmail) {
        normalizedEmail = validator.trim(normalizedEmail)
      }

      if (
        !normalizedEmail ||
        !validator.isEmail(normalizedEmail, { allow_utf8_local_part: false })
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST
        })
      }

      Object.assign(req.body, { email: normalizedEmail })

      return next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  updatePassword: (
    {
      body: { oldPassword, newPassword, confirmNewPassword }
    }: ICombinedRequest<IUserRequest, UpdatePasswordPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!oldPassword || !newPassword || !confirmNewPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid request to reset password',
          status: StatusCodes.BAD_REQUEST
        })
      }

      switch (true) {
        case !isValidPassword(oldPassword):
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Old password is invalid',
            status: StatusCodes.BAD_REQUEST
          })
        case !isValidPassword(newPassword):
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'New password is invalid',
            status: StatusCodes.BAD_REQUEST
          })
        case !isValidPassword(confirmNewPassword):
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Confirm new password is invalid',
            status: StatusCodes.BAD_REQUEST
          })
        case oldPassword === newPassword:
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: 'Old password and new password is the same',
            status: StatusCodes.BAD_REQUEST
          })
        case newPassword !== confirmNewPassword:
          return res.status(StatusCodes.BAD_REQUEST).json({
            // eslint-disable-next-line quotes
            message: `New password and confirm new password does'nt match each other`,
            status: StatusCodes.BAD_REQUEST
          })
        default:
          break
      }

      return next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  updateAvatar: (
    { body: { imageId } }: IBodyRequest<{ imageId: ObjectId }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!imageId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST
        })
      }

      return next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  deleteProfile: (
    { body: { password } }: IBodyRequest<DeleteProfilePayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ReasonPhrases.BAD_REQUEST,
          status: StatusCodes.BAD_REQUEST
        })
      }

      return next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  }
}
