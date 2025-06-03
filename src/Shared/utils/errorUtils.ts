import type { HttpKeys } from './http.utils'

import { generateHttpMessage } from './http.utils'

export class GenericError extends Error {
  statusCode: number
  nameType: string
  constructor(
    name: string,
    message: string,
    nameType: string,
    statusCode: number
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name = name
    this.statusCode = statusCode
    this.nameType = nameType
  }

  formalize() {
    return {
      status: 'error',
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      nameType: this.nameType
    }
  }
}

// type StatusCodeKeys = keyof typeof statusCodeHandle

export const customError = (type: HttpKeys, msg?: string) => {
  const { status, nameType } = generateHttpMessage(type)
  return new GenericError(type, msg || nameType, nameType, status)
}
