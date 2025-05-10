import dotenv from 'dotenv'

import type { Environments, EnvironmentsType } from './environments.interface'

import { defaultEnv } from './default'
import development from './development'
import production from './production'
import test from './test'

dotenv.config()

const environments: Record<EnvironmentsType, (env: any) => Environments> = {
  development: (env) => development(env),
  production: (env) => production(env),
  test: (env) => test(env)
}

const { NODE_ENV = 'development' } = process.env

const env = environments[NODE_ENV as EnvironmentsType](process.env)
const currentEnv = { ...defaultEnv(process.env), ...env }

currentEnv.server.url = `${currentEnv.server.host}:${currentEnv.server.port}`

export default currentEnv
