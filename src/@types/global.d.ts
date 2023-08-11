export declare global {
  namespace Express {
    interface Request {
      context: Context
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: number
      APP_URL: string
      CLIENT_URL: string
      MONGODB_URI: string
      REDIS_URI: string
      REDIS_TOKEN_EXPIRATION: number
      JWT_SECRET: string
      JWT_EXPIRATION: string
      MAIL_HOST: string
      MAIL_PORT: number
      MAIL_USER: string
      MAIL_PASSWORD: string
      MAIL_TPL_PATH: string
      STORAGE_PATH: string
      FIREBASE_API_KEY: string
      FIREBASE_AUTH_DOMAIN: string
      FIREBASE_PROJECT_ID: string
      FIREBASE_STORAGE_BUCKET: string
      FIREBASE_MESSAGING_SENDER_ID: string
      FIREBASE_APP_ID: string
      FIREBASE_MEASURMENT_ID: string
    }
  }
}
