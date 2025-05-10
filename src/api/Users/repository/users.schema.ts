import { NextFunction } from 'express'
import { HydratedDocument, model, Schema } from 'mongoose'

import { IUsers } from '@Api/Users/interfaces/users.interface'

import { customError } from '../../../Shared/utils/errorUtils'
import { generatePasswordHash } from '../helpers/users.helpers'

const UserOrganizations: Schema = new Schema<IUsers['organizations']>({
  _id: { type: String, required: false },
  organizationId: { type: String, required: false, ref: 'Organizations' },
  role: { type: Number, required: false },
  status: { type: Object, required: false },
  settings: { type: Object, required: false },
  profile: { type: Object, required: false },
  folderPermissions: { type: Object, required: false }
})

const UsersSchema: Schema = new Schema<IUsers>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    passwordHash: { type: String },
    timezone: { type: String, required: false },
    organizations: [UserOrganizations],
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
