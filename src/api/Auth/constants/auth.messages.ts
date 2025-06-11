interface authMessages {
  login: string
  logout: string
  sing_up: string
  sign_out: string
  is_authenticated: string
  refresh_token: string
  no_token: string
  invalid_credentials: string
  invalid_token: string
  unauthorized: string
  params_missing: string
  accessDenied: string
  registration_success: string
  verification_email_sent: string
  email_verified: string
  email_already_verified: string
  verification_failed: string
  account_not_verified: string
}

export const AUTH_MESSAGES: authMessages = {
  login: 'Login successful',
  logout: 'Logout successful',
  is_authenticated: 'Authenticated',
  sing_up: 'Sign Up successful',
  sign_out: 'Session closed',
  refresh_token: 'Refresh token successful',
  no_token: 'No token provided',
  invalid_credentials: 'Invalid credentials',
  invalid_token: 'Invalid token',
  unauthorized: 'Unauthorized',
  params_missing: 'Required parameters are missing',
  accessDenied: 'Access Denied',
  registration_success:
    'Registration successful. Please check your email to verify your account.',
  verification_email_sent: 'Verification email sent successfully',
  email_verified: 'Email verified successfully',
  email_already_verified: 'Email already verified',
  verification_failed: 'Email verification failed',
  account_not_verified:
    'Account not verified. Please check your email and verify your account.'
}
