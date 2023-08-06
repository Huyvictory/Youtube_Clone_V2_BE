import { NextFunction, Response } from 'express'
import validator from 'validator'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import winston from 'winston'

import {
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  ResetNewPasswordPayload,
  ResetPasswordCodePayload
} from '@/contracts/auth'
import { IBodyRequest, ICombinedRequest } from '@/contracts/request'
import { isValidPassword } from '@/utils/password'

export const authValidation = {
  signIn: (
    req: IBodyRequest<SignInPayload>,
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

  signUp: (
    req: IBodyRequest<SignUpPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (
        !req.body.email ||
        !req.body.password ||
        !req.body.firstname ||
        !req.body.lastname
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Missing fields to register',
          status: StatusCodes.BAD_REQUEST
        })
      }

      if (!isValidPassword(req.body.password)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid password !',
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
          message: 'Email is invalid',
          status: StatusCodes.BAD_REQUEST
        })
      }

      Object.assign(req.body, {
        email: normalizedEmail,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        Dob: req.body.Dob ?? null,
        sex: req.body.sex ?? null
      })

      return next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  resetPasswordCodeValidation: async (
    req: ICombinedRequest<
      null,
      ResetPasswordCodePayload,
      { resetPasswordToken: string }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body.reset_password_code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'No reset password code was provided',
          status: StatusCodes.BAD_REQUEST
        })
      }

      next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  resetPassword: (
    req: IBodyRequest<ResetPasswordPayload>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body.email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'No email has been sent',
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
          message: 'The email you typed was not a valid one',
          status: StatusCodes.BAD_REQUEST
        })
      }

      Object.assign(req.body, { email: normalizedEmail })

      return next()
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  newPassword: (
    req: ICombinedRequest<
      null,
      ResetNewPasswordPayload,
      { resetPasswordToken: string }
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body.newPassword || !req.body.confirmNewPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Missing data to continue implementing the request',
          status: StatusCodes.BAD_REQUEST
        })
      }
      if (
        !isValidPassword(req.body.newPassword) ||
        !isValidPassword(req.body.confirmNewPassword)
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'The requested passwords are invalid',
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
