import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

import { customError } from '@src/Shared/utils/errorUtils'

const validator =
  (schema: Joi.AnySchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error != null) {
      const { details } = error
      const message = details.map((d) => d.message).join(',')
      customError('notFound', message)
    }
    next()
  }

export default validator
