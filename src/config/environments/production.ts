import type { Environments } from './environments.interface'

const configuration = (env: any): Environments => {
  return {
    environment: 'production',
    dataBase: {
      mongo: {
        url: env.MONGODB_URI
      },
      redis: {
        uri: env?.REDIS_URI
      }
    },
    server: {
      host: '' + env.API_HOST,
      port: '' + env.API_PORT,
      url: env.API_URL
    },
    multer: {
      destiny: env.MULTER_DESTINY || './data',
      fileSize: 1.5 * 1000 * 1000 * 2000
    },
    cors: {
      origin: env.API_CORS_ORIGIN?.split(',') || [
        'adaptcv-frontend.vercel.app'
      ],
      optionsSuccessStatus: 200
    },
    secret: env.SECRET,
    jwtSecret: env.JWT_SECRET,
    cookieSecret: env.COOKIE_SECRET,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS || 10
  }
}

export default configuration
