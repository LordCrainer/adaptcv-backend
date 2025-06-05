import { HttpStatusCode } from 'axios'

import type { CookieOptions, Response } from 'express'

import { generateHttpMessage, HttpKeys } from './http.utils'

class ApiResponse {
  res: Response
  constructor(res: Response) {
    this.res = res
  }

  static success(res: Response): ApiResponse {
    return new ApiResponse(res).status(HttpStatusCode.Ok)
  }

  static created(res: Response): ApiResponse {
    return new ApiResponse(res).status(HttpStatusCode.Created)
  }

  static accepted(res: Response): ApiResponse {
    return new ApiResponse(res).status(HttpStatusCode.Accepted)
  }
  static noContent(res: Response): ApiResponse {
    return new ApiResponse(res).status(HttpStatusCode.NoContent)
  }

  static setName(res: Response, label: HttpKeys) {
    return new ApiResponse(res).status(generateHttpMessage(label).status)
  }

  setName(key: HttpKeys) {
    const { status, nameType } = generateHttpMessage(key)
    this.res.status(status)
    this.res.setHeader('x-status-name', nameType)
    return this
  }

  status(code: number): ApiResponse {
    this.res.status(code)
    return this
  }

  setCookie(key: string, value: string, options?: CookieOptions) {
    const SEVEN_DAYS = 24 * 3600 * 1000 * 7
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + SEVEN_DAYS)
    }
    this.res.cookie(key, value, { ...defaultOptions, ...options })
    return this
  }

  clearCookie(key: string) {
    this.res.cookie(key, '')
    return this
  }

  json({ message, data, pagination }: IApiResponse): ApiResponse {
    this.res.json({
      message,
      pagination,
      data
    })
    return this
  }
}

export default ApiResponse
