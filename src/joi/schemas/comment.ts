import Joi from 'joi'

const createCommentVideo_Schema = Joi.object({
  comment_content: Joi.string().required(),
  comment_user_id: Joi.string().required()
})

export { createCommentVideo_Schema }
