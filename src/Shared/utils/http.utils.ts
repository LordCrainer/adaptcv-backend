type StatusCode =
  | 200
  | 201
  | 202
  | 204
  | 400
  | 401
  | 403
  | 404
  | 405
  | 408
  | 409
  | 413
  | 500
type StatusLabel<T extends StatusCode> = keyof (typeof statusCodeHandle)[T]
export type HttpKeys = { [K in StatusCode]: StatusLabel<K> }[StatusCode]

const statusCodeHandle = {
  200: {
    ok: 'OK',
    success: 'Success'
  },
  201: {
    created: 'Created',
    resourceCreated: 'Resource Created'
  },
  202: {
    accepted: 'Accepted',
    resourceAccepted: 'Resource Accepted'
  },
  204: {
    noContent: 'No Content',
    resourceDeleted: 'Resource Deleted'
  },
  413: {
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
  405: {
    methodNotAllowed: 'Method Not Allowed'
  },
  408: {
    requestTimeout: 'Request Timeout'
  },
  409: {
    conflict: 'Conflict',
    resourceConflict: 'Resource Conflict'
  },
  500: {
    internalServerError: 'Internal Server Error'
  }
} as const

const generateHttpType = () => {
  const httpType: Record<string, number> = {}
  for (const code in statusCodeHandle) {
    for (const name in statusCodeHandle[+code as StatusCode]) {
      httpType[name] = +code
    }
  }
  return httpType
}

const httpType = generateHttpType()

export const generateHttpMessage = (type: HttpKeys) => {
  if (!type) {
    throw new Error(`Error type is required`)
  }
  const status = (httpType[type] as StatusCode) || 500
  const nameType = (statusCodeHandle[status] as Record<string, string>)[type]
  return { status, nameType }
}
