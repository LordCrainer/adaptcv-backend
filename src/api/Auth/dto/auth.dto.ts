import { IUsers } from '@lordcrainer/adaptcv-shared-types'

import { TokenLoginResponse } from './auth.interface'

export class AuthResponseDto {
  user!: IUsers
  accessToken!: string
  refreshToken!: string

  constructor(partial: AuthResponseDto) {
    this.accessToken = partial.accessToken || ''
    this.user = partial.user || ({} as IUsers)
    this.refreshToken = partial.refreshToken || ''
  }
}
