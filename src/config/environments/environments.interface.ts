export type EnvironmentsType = 'development' | 'production' | 'test'
export interface Environments {
  environment: EnvironmentsType
  dataBase: {
    mongo: Mongo
    mysql?: {
      host: string
      user: string
      password: string
      database: string
      uri?: string
    }
    redis: {
      uri: string
    }
  }
  server: Server
  jwtSecret: string
  multer: Multer
  cors: Cors
  secret: string
  bcryptSaltRounds: number
  storage?: Storage
  debugs?: Partial<Debugs>
  configGeneral?: Partial<ConfigGeneral>
}

interface ConfigGeneral {
  trustProxy: boolean
}

interface Debugs {
  test: boolean
  skipClear: boolean
  debug: boolean
}

interface Storage {
  // local: Local;
  doSpace: DOSpace
}

interface DOSpace {
  bucketEndpoint: string
  region: string
  keyId: string
  secret: string
}

interface Mongo {
  url: string
  enableInstance?: boolean
  enableDbPath?: boolean
}

interface Server {
  host: string
  port: number | string
  url?: string
}

interface Multer {
  destiny: string
  fileSize: number
}

interface Cors {
  origin: string
  optionsSuccessStatus: number
}
