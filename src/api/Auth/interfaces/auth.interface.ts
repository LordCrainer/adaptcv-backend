import jwt from 'jsonwebtoken'

import type {
  IUsers,
  LoginOutput,
  RequestUserData
} from '@lordcrainer/adaptcv-shared-types'

export { RequestUserData }

/**
 * @export
 * @interface IAuthService
 */
export interface IAuthService {
  /**
   * @param {User} params
   * @returns {Promise<IUsers>}
   * @memberof AuthService
   */
  login: (params: IUsers) => Promise<IApiResponse<LoginOutput>>
  /**
   * @param {User} user
   * @returns {Promise<IUsers>}
   * @memberof AuthService
   */
  signUp: (user: IUsers) => Promise<IApiResponse<IUsers>>

  isAuthenticated: (token: string) => Promise<IApiResponse<Boolean>>

  generateToken: (
    user: IUsers,
    options?: jwt.SignOptions & { expireSeconds?: number }
  ) => { token: string; expiresAt: number; createdAt: number }
}
