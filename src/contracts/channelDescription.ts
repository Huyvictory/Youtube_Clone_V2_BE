import { Model, ObjectId } from 'mongoose'

export interface IChannelDescription {
  descption_overview: string
  descripton_contact_info: string
  description_links: ObjectId[]
}

export type ChannelDescriptionModel = Model<IChannelDescription>
