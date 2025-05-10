import { NextFunction, Request, Response } from 'express'

export interface IController<T> {
  (
    req: { query: Partial<T> } | Request,
    res: Response,
    next: NextFunction
  ): void
}
