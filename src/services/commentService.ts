import { CommentSchema, VideoSchema } from '@/models'
import { ClientSession } from 'mongoose'

export const commentService = {
  createNewComment_Video: async (
    {
      comment_content,
      comment_user_id
    }: {
      comment_content: string
      comment_user_id: string
    },
    session: ClientSession
  ) => {
    return await new CommentSchema({ comment_content, comment_user_id }).save({
      session
    })
  },

  getListCommentsVideo: ({ videoId }: { videoId: string }) => {
    return VideoSchema.findById({ _id: videoId })
  }
}
