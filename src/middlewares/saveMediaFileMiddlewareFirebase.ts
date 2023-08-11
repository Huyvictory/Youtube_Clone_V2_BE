import { NextFunction, Request, Response } from 'express'
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable
} from 'firebase/storage'

import { StatusCodes } from 'http-status-codes'
import winston from 'winston'
import dayjs from 'dayjs'

export const saveMediaFileFirebase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Initialize Cloud Storage and get a reference to the service
  const storage = getStorage()

  try {
    const storageRef = ref(
      storage,
      req.body.typeMedia === 'image'
        ? `Images/${req?.file?.originalname} ${dayjs().format()}`
        : `Videos/${req?.file?.originalname} ${dayjs().format()}`
    )

    // Create file metadata including the content type
    const metadata = {
      contentType: req?.file?.mimetype
    }

    // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(
      storageRef,
      req?.file?.buffer as Buffer,
      metadata
    )
    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

    // Grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref)

    Object.assign(req, {
      body: { ...req.body, mediaUrl: downloadURL }
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
