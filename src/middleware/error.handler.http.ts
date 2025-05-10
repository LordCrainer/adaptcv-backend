import type { NextFunction, Request, Response } from 'express'

import { customError, GenericError } from '@Shared/utils/errorUtils'
import currentEnv from '@src/config/environments'
import Logger from '@src/lib/logger'

export const errorHandler = (
  err: GenericError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response = err?.statusCode
    ? err.formalize()
    : customError(
        'internalServerError',
        'An unexpected error occurred. Please try again later.'
      ).formalize()

  Logger.error(
    JSON.stringify({
      ...response,
      status: undefined
    })
  )

  if (currentEnv.debugs?.debug) {
    console.error(err?.stack)
  }

  res.status(response.statusCode).json(response)
}
