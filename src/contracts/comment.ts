import { Model, ObjectId } from 'mongoose'

export interface IComment {
  comment_content: string
  comment_user_id: ObjectId
}

export type CommentModel = Model<IComment>
