import { NextFunction, Request, Response } from 'express'

import { RequestUserData } from '@Api/Auth/interfaces/auth.interface'
import { IUsers } from '@Api/Users/interfaces/users.interface'

interface RequestExtended<T = any> extends Request {
  requestUser?: RequestUserData
  token?: string
  query?: Partial<T>
}

declare global {
  interface IController<T = any> {
    (req: RequestExtended<T>, res: Response, next: NextFunction): void
  }

  type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<RecursivePartial<U>>
      : T[P] extends object
        ? RecursivePartial<T[P]>
        : T[P]
  }

  type NestedKeyOf<T extends object> = {
    [Key in keyof T & (string | number)]: T[Key] extends Function
      ? never
      : T[Key] extends object
        ? T[Key] extends any[]
          ? `${Key}`
          : `${Key}` | `${Key}.${NestedKeyOf<T[Key]>}`
        : `${Key}`
  }[keyof T & (string | number)]

  type RecursivePartialWithDotNotation<T> = {
    [P in NestedKeyOf<T>]?: P extends `${infer Key}.${infer Rest}`
      ? Key extends keyof T
        ? Rest extends NestedKeyOf<T[Key]>
          ? RecursivePartialWithDotNotation<T[Key]>
          : never
        : never
      : P extends keyof T
        ? T[P] extends Array<infer U>
          ? Array<RecursivePartialWithDotNotation<U>>
          : T[P] extends object
            ? RecursivePartialWithDotNotation<T[P]>
            : T[P]
        : never
  }

  interface Pagination {
    total: number
    page: number
    limit: number
    totalPages: number
    skip?: number
  }

  interface IApiResponse<T> {
    success?: boolean
    message?: string
    data?: T
    pagination?: Pagination
    errorCode?: string
  }
}
