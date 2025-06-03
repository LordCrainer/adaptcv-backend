import { HttpStatusCode } from 'axios'

import type { CookieOptions, Response } from 'express'

import { generateHttpMessage, HttpKeys } from './http.utils'

interface IResponseJson {
  message: string
  data: any
  pagination?: Pagination
}

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

  json({ message, data, pagination }: IResponseJson): ApiResponse {
    this.res.json({
      message,
      pagination,
      data
    })
    return this
  }
}

export default ApiResponse
