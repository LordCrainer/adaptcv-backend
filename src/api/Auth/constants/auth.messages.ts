import type { Langs } from '@Shared/utils/define'

interface authMessages {
  login: string
  logout: string
  sing_up: string
  sign_out: string
  is_authenticated: string
  no_token: string
  invalid_credentials: string
  invalid_token: string
  unauthorized: string
  params_missing: string
  accessDenied: string
}

export const AUTH_MESSAGES: authMessages = {
  login: 'Login successful',
  logout: 'Logout successful',
  is_authenticated: 'Authenticated',
  sing_up: 'Sign Up successful',
  sign_out: 'Session closed',
  no_token: 'No token provided',
  invalid_credentials: 'Invalid credentials',
  invalid_token: 'Invalid token',
  unauthorized: 'Unauthorized',
  params_missing: 'Required parameters are missing',
  accessDenied: 'Access Denied'
}
