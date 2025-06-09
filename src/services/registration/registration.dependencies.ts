import { userRepositoryMongo } from '@src/api/Users/users.dependencies'
import {
  emailProvider,
  templateService
} from '@src/services/email/email.dependencies'
import { verificationService } from '@src/services/verification/verification.dependencies'

import { RegistrationService } from './registration.service'

export const registrationService = new RegistrationService(
  userRepositoryMongo,
  verificationService,
  emailProvider,
  templateService
)
