import Joi from 'joi'

const userCreatePlaylist_Schema = Joi.object({
  playlist_name: Joi.string().required(),
  playlist_description: Joi.string()
})

export { userCreatePlaylist_Schema }
