import type { Environments } from './environments.interface'

const configuration = (env: any): Environments => {
  return {
    environment: 'test',
    dataBase: {
      mongo: {
        url: env.MONGODB_URI || 'mongodb://localhost:27017/lntv',
        enableInstance: env.MONGODB_TEST_CREATE_INSTANCE || true,
        enableDbPath: env.MONGODB_TEST_ENABLE_DB_PATH || false
      },
      mysql: {
        host: env.MYSQL_HOST || 'localhost',
        user: env.MYSQL_USER || 'root',
        password: env.MYSQL_PASSWORD || 'root',
        database: env.MYSQL_DATABASE || 'lntv',
        uri: env.MYSQL_URI || 'mysql://root:root@localhost:3306/lntv'
      },
      redis: {
        uri: `redis://localhost:6380/1`
      }
    },
    server: {
      host: env.API_HOST || 'localhost',
      port: env.API_PORT || 3010
    },
    multer: {
      destiny: env.PATH_ORIGIN || './data',
      fileSize: 1.5 * 1000 * 1000 * 2000
    },
    cors: {
      origin: env.API_CORS_ORIGIN || 'localhost:4000/',
      optionsSuccessStatus: 200
    },
    storage: {
      doSpace: {
        bucketEndpoint: env.DO_SPACES_BUCKET_ENDPOINT || 'localhost',
        region: env.DO_SPACES_REGION || 'localhost',
        keyId: env.DO_SPACES_KEY || 'localhost',
        secret: env.DO_SPACES_SECRET || 'localhost'
      }
    },
    secret: env.SECRET || 'develop',
    jwtSecret: env.JWT_SECRET || 'develop',
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS || 10,
    configGeneral: {
      trustProxy: env?.TRUST_PROXY ?? false
    }
  }
}

export default configuration
