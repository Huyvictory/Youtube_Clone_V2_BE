import { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'

import { ImageSizeInMb, Mimetype } from '@/constants'
import { mbToBytes } from '@/utils/maths'

const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const mimetypes: string[] = Object.values(Mimetype)

  if (!mimetypes.includes(file.mimetype)) {
    return cb(new Error(`Only ${mimetypes} files are allowed.`))
  }

  cb(null, true)
}

const upload = multer({
  limits: { fileSize: mbToBytes(ImageSizeInMb.Ten) },
  fileFilter,
  storage: multer.memoryStorage()
})

export const uploadSingleImage = upload.single('file')
