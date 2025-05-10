import { model, Schema } from 'mongoose'

import type { IUsers } from '@lordcrainer/adaptcv-shared-types'
import type { NextFunction } from 'express'
import type { HydratedDocument } from 'mongoose'

import { customError } from '../../../Shared/utils/errorUtils'
import { generatePasswordHash } from '../helpers/users.helpers'

const UsersSchema: Schema = new Schema<IUsers>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    passwordHash: { type: String },
    timezone: { type: String, required: false },
    isSuperAdmin: { type: Boolean, required: false }
  },
  { versionKey: false, _id: false, timestamps: true }
)

UsersSchema.pre(
  'save',
  async function (
    this: HydratedDocument<IUsers>,
    next: NextFunction
  ): Promise<void> {
    if (!this.isModified('password')) {
      return next()
    }
    try {
      if (!this.password) {
        throw customError('notFound', 'Password is required')
      }
      this.passwordHash = await generatePasswordHash(this.password as string)
      this.password = ''
      next()
    } catch (error) {
      return next(error)
    }
  }
)

const usersModel = model<IUsers>('Users', UsersSchema)
export { usersModel }
