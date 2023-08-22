import { Router } from 'express'

import { auth } from './auth'
import { users } from './users'
import { media } from './media'
import { video } from './video'
import { channel } from './channel'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { auth, users, media, video, channel }

for (const route in routes) {
  routes[route](router)
}

export { router }
