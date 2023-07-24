import {
  ChannelDescriptionModel,
  IChannelDescription
} from '@/contracts/channelDescription'
import { Schema, model } from 'mongoose'

const schema = new Schema<IChannelDescription, ChannelDescriptionModel>(
  {
    descption_overview: {
      type: String
    },
    descripton_contact_info: {
      type: String
    },
    description_links: {
      type: [{ type: Schema.Types.ObjectId }],
      ref: 'ContactLink'
    }
  },
  { timestamps: true }
)

export const ChannelDescriptionSchema = model<
  IChannelDescription,
  ChannelDescriptionModel
>('ChannelDescription', schema)
