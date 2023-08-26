import Joi from 'joi'

const videoListQueryString_Schema = Joi.object({
  page: Joi.number().required(),
  limit: Joi.number().required(),
  videoCategory: Joi.array().items(Joi.string()),
  channelId: Joi.string()
})

export { videoListQueryString_Schema }
