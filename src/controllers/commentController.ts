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
            select: ['user_avatar_media_id', 'username'],
            populate: {
              path: 'user_avatar_media_id',
              model: 'Media',
              select: ['media_url']
            }
          }
        })

      return res.status(StatusCodes.OK).json({
        data: videoDetail
          ?.toJSON()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .video_commments.map((el: any) => {
            return {
              ...el,
              user_avatar_url:
                el.comment_user_id.user_avatar_media_id.media_url,
              user_name: el.comment_user_id.username,
              user_avatar_media_id: undefined,
              comment_user_id: undefined
            }
          }),
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
  },
  updateCommentVideo: async (req: Request, res: Response) => {
    try {
      await commentService.updateCommentVideo({
        commentId: req.params.commentId,
        comment_content: req.body.comment_content
      })

      return res.status(StatusCodes.OK).json({
        message: 'Updated comment of a video successfully',
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }
  },
  deleteCommentVideo: async (req: Request, res: Response) => {
    const session = await startSession()
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videoDetail: any = await videoService.getVideoById(req.body.videoId)

      session.startTransaction()

      const deletedComment = await commentService.deleteCommentVideo(
        { commentId: req.params.commentId },
        session
      )

      videoDetail.video_commments = videoDetail?.video_commments.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el: any) => String(el) !== deletedComment?.id
      )

      await videoDetail.save({ session })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: 'Deleted comment of a video successfully !',
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
