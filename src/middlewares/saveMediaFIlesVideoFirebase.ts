/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response } from 'express'
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable
} from 'firebase/storage'

import { StatusCodes } from 'http-status-codes'
import winston from 'winston'
import dayjs from 'dayjs'

export const saveMediaFilesVideoFirebase = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  // Initialize Cloud Storage and get a reference to the service
  const storage = getStorage()

  try {
    const mediaFilesDetails = []
    // Video thumbnail
    if (req.files['video_thumbnail']) {
      const storageRefVideoThumbnail = ref(
        storage,
        `Images/${
          req?.files['video_thumbnail'][0].originalname
        } ${dayjs().format()}`
      )

      // Upload the file in the bucket storage
      const snapshotVideoThumbnail = await uploadBytesResumable(
        storageRefVideoThumbnail,
        req?.files['video_thumbnail'][0].buffer as Buffer,
        { contentType: req.files['video_thumbnail'][0].mimetype }
      )

      // Grab the public url
      const downloadURL_VideoThumbnail = await getDownloadURL(
        snapshotVideoThumbnail.ref
      )

      mediaFilesDetails.push({
        name: 'video_thumbnail',
        url: downloadURL_VideoThumbnail,
        mediaFileName: snapshotVideoThumbnail.ref.name
      })
    }

    // Video
    if (req.files['video']) {
      const storageRefVideo = ref(
        storage,
        `Videos/${req?.files['video'][0].originalname} ${dayjs().format()}`
      )

      // Upload the file in the bucket storage
      const snapshotVideo = await uploadBytesResumable(
        storageRefVideo,
        req?.files['video'][0].buffer as Buffer,
        { contentType: req.files['video'][0].mimetype }
      )

      // Grab the public url
      const downloadURLVideo = await getDownloadURL(snapshotVideo.ref)

      mediaFilesDetails.push({
        name: 'video',
        url: downloadURLVideo,
        mediaFileName: snapshotVideo.ref.name
      })
    }

    Object.assign(req, {
      body: {
        ...req.body,
        mediaFilesDetails
      }
    })

    return next()
  } catch (error) {
    winston.error(error)
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Error in trying to save your files, please try again',
      status: StatusCodes.BAD_REQUEST
    })
  }
}
