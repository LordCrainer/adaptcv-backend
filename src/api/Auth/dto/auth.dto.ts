import { IUsers } from '@lordcrainer/adaptcv-shared-types'

import { TokenLoginResponse } from './auth.interface'

export class AuthResponseDto {
  user!: IUsers
  token!: string
  refreshToken!: TokenLoginResponse

  constructor(partial: AuthResponseDto) {
    this.token = partial.token || ''
    this.user = partial.user || ({} as IUsers)
    this.refreshToken = partial.refreshToken || ({} as TokenLoginResponse)
  }
}
