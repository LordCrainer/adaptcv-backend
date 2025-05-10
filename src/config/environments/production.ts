import type { Environments } from './environments.interface'

const configuration = (env: any): Environments => {
  return {
    environment: 'production',
    dataBase: {
      mongo: {
        url: '' + env.MONGODB_URI
      },
      redis: {
        uri: '' + env.REDIS_URI
      }
    },
    server: {
      host: '' + env.API_HOST,
      port: '' + env.API_PORT
    },
    multer: {
      destiny: env.MULTER_DESTINY || './data',
      fileSize: 1.5 * 1000 * 1000 * 2000
    },
    cors: {
      origin: env.API_CORS_ORIGIN || '*',
      optionsSuccessStatus: 200
    },
    secret: env.SECRET || 'production',
    jwtSecret: env.JWT_SECRET,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS || 10
  }
}

export default configuration
