/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCommentVideo_Schema } from '@/joi/schemas/comment'
import { userService } from '@/services'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import winston from 'winston'

export const commentValidation = {
  createCommentVideoValidation: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await createCommentVideo_Schema.validateAsync({
        comment_content: req.body.comment_content,
        comment_user_id: req.context.user.id
      })

      const userDetail = await userService.getById(req.context.user.id)
      if (!userDetail) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: 'Invalid user id', status: StatusCodes.BAD_REQUEST })
      }
      next()
    } catch (error: any) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          error?.details?.map((el: any) => el.message) || 'Invalid user id',
        status: StatusCodes.BAD_REQUEST
      })
    }
  }
}
