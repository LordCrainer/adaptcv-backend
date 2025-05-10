export interface Components {
  auth: Langs<AuthDefines>
  workflow: Langs<any>
}

interface AuthDefines {
  login: string
  sing_up: string
  sign_out: string
  no_token: string
}

export interface Langs<T> {
  en: T
  es: T
}

export interface ApiMessages {
  updated: string
  created: string
  deleted: string
  find: string
  findOne: string
  restored?: string
  not_restored?: string
  not_found: string
  not_created: string
  not_updated: string
  not_deleted: string
}
