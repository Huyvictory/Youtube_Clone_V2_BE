import { Model } from 'mongoose'

export interface IContactLink {
  link_name: string
  link_url: string
}

export type ContactLinkModel = Model<IContactLink>
