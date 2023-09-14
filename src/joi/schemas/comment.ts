import Joi from 'joi'

const createCommentVideo_Schema = Joi.object({
  comment_content: Joi.string().required(),
  comment_user_id: Joi.string().required()
})

const updateCommentVideo_Schema = Joi.object({
  commentId: Joi.string().required(),
  comment_content: Joi.string().required()
})

const deleteCommentVideo_Schema = Joi.object({
  videoId: Joi.string().required(),
  commentId: Joi.string().required()
})

export {
  createCommentVideo_Schema,
  updateCommentVideo_Schema,
  deleteCommentVideo_Schema
}
