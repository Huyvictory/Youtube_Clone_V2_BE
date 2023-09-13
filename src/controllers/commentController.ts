import { videoService } from '@/services'
import { commentService } from '@/services/commentService'
import { Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { startSession } from 'mongoose'
import winston from 'winston'

export const commentController = {
  createCommentVideo: async (req: Request, res: Response) => {
    const session = await startSession()
    try {
      const videoDetail = await videoService.getVideoById(req.params.videoId)

      session.startTransaction()

      const newComment = await commentService.createNewComment_Video(
        {
          comment_content: req.body.comment_content,
          comment_user_id: req.context.user.id
        },
        session
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      videoDetail?.video_commments.push(newComment.id as any)

      await videoDetail?.save({ session })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: 'Comment created successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  getListCommentsVideo: async (req: Request, res: Response) => {
    try {
      const videoDetail = await commentService
        .getListCommentsVideo({
          videoId: req.params.videoId
        })
        .select('video_commments')
        .populate({
          path: 'video_commments',
          model: 'Comment',
          populate: {
            path: 'comment_user_id',
            model: 'User',
            select: ['user_avatar_media_id'],
            populate: {
              path: 'user_avatar_media_id',
              model: 'Media',
              select: ['media_url']
            }
          }
        })

      return res.status(StatusCodes.OK).json({
        data: {
          ...videoDetail?.toJSON(),
          video_commments: videoDetail
            ?.toJSON()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .video_commments.map((el: any) => {
              return {
                ...el,
                user_avatar_url:
                  el.comment_user_id.user_avatar_media_id.media_url,
                user_avatar_media_id: undefined,
                comment_user_id: undefined
              }
            })
        },
        message: 'Get list comments of a video successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  }
}
