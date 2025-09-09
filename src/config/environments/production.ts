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
        'https://adaptcv-frontend.vercel.app'
      ],
      optionsSuccessStatus: 200
    },
    email: {
      smtp: {
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(env.SMTP_PORT) || 587,
        secure: env.SMTP_SECURE === 'true' || false,
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD
      },
      from: env.EMAIL_FROM || env.SMTP_USER,
      verificationBaseUrl: env.EMAIL_VERIFICATION_BASE_URL || env.API_URL
    },
    secret: env.SECRET,
    jwtSecret: env.JWT_SECRET,
    cookieSecret: env.COOKIE_SECRET,
    cookieDomain: env.COOKIE_DOMAIN || 'localhost',
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS || 10
  }
}

export default configuration
