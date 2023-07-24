import { CommentModel, IComment } from '@/contracts/comment'
import { Schema, model } from 'mongoose'

const schema = new Schema<IComment, CommentModel>(
  {
    comment_content: {
      type: String,
      required: true
    },
    comment_user_id: {
      type: Schema.Types.ObjectId,
      require: true
    }
  },
  { timestamps: true }
)

export const CommentSchema = model<IComment, CommentModel>('Comment', schema)
