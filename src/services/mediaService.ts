import { ClientSession, ObjectId } from 'mongoose'

import { MediaSchema } from '@/models'
import { CreateMediaPayload } from '@/contracts/media'
import { MediaRefType } from '@/constants'

export const mediaService = {
  getById: (mediaId: ObjectId) => MediaSchema.findById(mediaId),

  findOneByRef: ({
    refType,
    refId
  }: {
    refType: MediaRefType
    refId: ObjectId
  }) => MediaSchema.findOne({ refType, refId }),

  findManyByRef: ({
    refType,
    refId
  }: {
    refType: MediaRefType
    refId: ObjectId
  }) => MediaSchema.find({ refType, refId }),

  // create: (
  //   {
  //     originalname,
  //     encoding,
  //     mimetype,
  //     destination,
  //     filename,
  //     path,
  //     size
  //   }: CreateMediaPayload,
  //   session?: ClientSession
  // ) =>
  //   new MediaSchema({
  //     originalname,
  //     encoding,
  //     mimetype,
  //     destination,
  //     filename,
  //     path,
  //     size
  //   }).save({ session }),

  // updateById: (
  //   mediaId: ObjectId,
  //   { refType, refId }: UpdateMediaPayload,
  //   session?: ClientSession
  // ) => {
  //   const data = [{ _id: mediaId }, { refType, refId }]

  //   let params = null

  //   if (session) {
  //     params = [...data, { session }]
  //   } else {
  //     params = data
  //   }

  //   return Media.updateOne(...params)
  // },

  // deleteById: (mediaId: ObjectId, session?: ClientSession) =>
  //   Media.deleteOne({ _id: mediaId }, { session }),

  // deleteManyByRef: (
  //   {
  //     refType,
  //     refId
  //   }: {
  //     refType: MediaRefType
  //     refId: ObjectId
  //   },
  //   session?: ClientSession
  // ) => Media.deleteMany({ refType, refId }, { session })
}
