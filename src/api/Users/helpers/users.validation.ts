import * as Joi from 'joi'

import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { UserCreationParams } from '../interfaces/users.interface'

import { customError } from '@src/Shared/utils/errorUtils'

const validationCreateUser = (body: UserCreationParams['body']) => {
  const validated = Joi.object<IUsers>()
    .keys({
      password: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string()
        .email({
          minDomainSegments: 2
        })
        .required()
    })
    .unknown()
    .validate(body)
  if (validated.error != null) {
    throw customError('validationParams', validated.error.message)
  }
  return true
}

export { validationCreateUser }
