import { Model, ObjectId } from 'mongoose'

export interface IMedia {
  media_type: string
  media_file_name: string
  media_url: string
  media_user_id: ObjectId
}

export type CreateOrUpdateAvatarPayload = {
  media_id: ObjectId | null
  media_type: string
  media_file_name: string
  media_url: string
  media_user_id: ObjectId
}

export type MediaModel = Model<IMedia>
