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

type StatusCode = 200 | 400 | 401 | 403 | 404 | 500
type ErrorKeys<T extends StatusCode> = keyof (typeof statusCodeHandle)[T]
type ErrorType = { [K in StatusCode]: ErrorKeys<K> }[StatusCode]

const statusCodeHandle = {
  200: {
    tooLarge: 'Request Entity Too Large'
  },
  400: {
    badRequest: 'Bad Request',
    validationParams: 'Validation Error'
  },
  401: {
    unauthorized: 'Unauthorized',
    invalidCredentials: 'Invalid Credentials',
    invalidToken: 'Invalid Token'
  },
  403: {
    forbidden: 'Forbidden',
    notAllowed: 'Method Not Allowed',
    accessDenied: 'Access Denied'
  },
  404: {
    notFound: 'Not Found',
    resourceNotFound: 'Resource Not Found'
  },
  500: {
    internalServerError: 'Internal Server Error'
  }
} as const

const generateTypeError = () => {
  const typeError: Record<string, number> = {}
  for (const code in statusCodeHandle) {
    for (const name in statusCodeHandle[+code as StatusCode]) {
      typeError[name] = +code
    }
  }
  return typeError
}

const typeError = generateTypeError()

const generateErrorMessage = (type: ErrorType) => {
  if (!type) {
    throw new Error(`Error type is required`)
  }
  const status = (typeError[type] as StatusCode) || 500
  const nameType = (statusCodeHandle[status] as Record<string, string>)[type]
  return { status, nameType }
}

export const customError = (type: ErrorType, msg?: string) => {
  const { status, nameType } = generateErrorMessage(type)
  return new GenericError(type, msg || nameType, nameType, status)
}
