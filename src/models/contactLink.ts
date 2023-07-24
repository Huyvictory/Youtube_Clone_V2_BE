import { ContactLinkModel, IContactLink } from '@/contracts/contactLink'
import { Schema, model } from 'mongoose'

const schema = new Schema<IContactLink, ContactLinkModel>(
  {
    link_name: {
      type: String,
      required: true
    },
    link_url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const ContactLinkSchema = model<IContactLink, ContactLinkModel>(
  'ContactLink',
  schema
)
