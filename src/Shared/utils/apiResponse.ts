import type { CookieOptions, Response } from 'express'

interface IResponse {
  message: string
  data: any
  error?: Error | null
}

export class ResponseUseCase {
  success: boolean
  message: string
  data: any
  error: Error | null
  constructor(data = null, message: string, success = true, error = null) {
    this.success = success
    this.message = message
    this.data = data ?? {}
    this.error = error
  }

  response() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.error ? { error: this.error } : {})
    }
  }
}

class ApiResponse {
  res: Response
  constructor(res: Response) {
    this.res = res
  }

  static success(res: Response): ApiResponse {
    return new ApiResponse(res).status(200)
  }

  static created(res: Response): ApiResponse {
    return new ApiResponse(res).status(201)
  }

  static accepted(res: Response): ApiResponse {
    return new ApiResponse(res).status(202)
  }
  static noContent(res: Response): ApiResponse {
    return new ApiResponse(res).status(204)
  }

  status(code: number): ApiResponse {
    this.res.status(code)
    return this
  }

  setCookie(key: string, value: string, options?: CookieOptions) {
    const ONE_DAY = 24 * 3600 * 1000
    this.res.cookie(key, value, {
      httpOnly: options?.httpOnly ?? true,
      secure: options?.secure ?? true,
      expires: options?.expires ?? new Date(Date.now() + ONE_DAY)
    })
    return this
  }

  clearCookie(key: string) {
    this.res.clearCookie(key)
    return this
  }

  json({
    message,
    data,
    pagination
  }: {
    message: string
    data: any
    pagination?: Pagination
  }): ApiResponse {
    this.res.json({
      message,
      pagination,
      data
    })
    return this
  }
}

export default ApiResponse

/* export default class ApiResponse {
  static result = (res: Response, data: object,
                   status: number = 200,
                   cookie: ICookie = null) => {
    res.status(status);
    if (cookie) {
      res.cookie(cookie.key, cookie.value);
    }
    res.json({
      data,
      success: true,
    });
  }

  static error = (res: Response,
                  status: number = 400,
                  error: string = httpStatusCodes.getStatusText(status),
                  override: IOverrideRequest = null) => {
    res.status(status).json({
      override,
      error: {
        message: error,
      },
      success: false,
    });
  }

  static setCookie = (res: Response, key: string, value: string) => {
    res.cookie(key, value);
  }
} */
