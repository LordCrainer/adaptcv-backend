import { IUsers } from '@lordcrainer/adaptcv-shared-types'

export class AuthResponseDto {
  user!: IUsers
  token!: string

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial)
  }
}
