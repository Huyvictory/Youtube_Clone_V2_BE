import { commentController } from '@/controllers/commentController'
import { authGuard } from '@/guards'
import { commentValidation } from '@/validations/commentValidation'
import { Router } from 'express'

export const comment = (router: Router): void => {
  router.post(
    '/create/comment/:videoId',
    authGuard.isAuth,
    commentValidation.createCommentVideoValidation,
    commentController.createCommentVideo
  )

  router.get(
    '/comment/list/:videoId',
    authGuard.isAuth,
    commentController.getListCommentsVideo
  )

  router.put(
    '/comment/update/:commentId',
    authGuard.isAuth,
    commentValidation.updateCommentVideoValidation,
    commentController.updateCommentVideo
  )

  router.delete(
    '/comment/delete/:commentId',
    authGuard.isAuth,
    commentValidation.deleteCommentVideoValidation,
    commentController.deleteCommentVideo
  )
}
