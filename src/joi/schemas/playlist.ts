import Joi from 'joi'

const userCreatePlaylist_Schema = Joi.object({
  playlist_name: Joi.string().required(),
  playlist_description: Joi.string()
})

const updateVideoPlaylist_Schema = Joi.object({
  videoId: Joi.string().required()
})

export { userCreatePlaylist_Schema, updateVideoPlaylist_Schema }
