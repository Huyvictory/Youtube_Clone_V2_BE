import { ClientSession, ObjectId } from 'mongoose'

import { MediaSchema } from '@/models'
import { CreateOrUpdateAvatarPayload } from '@/contracts/media'
import { MediaRefType } from '@/constants'

export const mediaService = {
  getById: (mediaId: string) => MediaSchema.findById({ _id: mediaId }),

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

  createOrUpdateImage: (
    {
      media_id,
      media_type,
      media_file_name,
      media_url,
      media_user_id
    }: CreateOrUpdateAvatarPayload,
    session?: ClientSession
  ) => {
    const operationData = [
      { _id: media_id },
      { media_type, media_file_name, media_url, media_user_id }
    ]

    let paramsQuery = null
    if (session) {
      paramsQuery = [...operationData, { new: true, session }]
    } else {
      paramsQuery = [...operationData, { new: true }]
    }

    if (!media_id) {
      return new MediaSchema({
        media_file_name,
        media_type,
        media_url,
        media_user_id
      }).save({ session })
    }

    return MediaSchema.findOneAndUpdate(...paramsQuery)
  },
  deleteById: (mediaId: string, session?: ClientSession) =>
    MediaSchema.findByIdAndDelete({ _id: mediaId }, { session })

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
