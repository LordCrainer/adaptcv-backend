import { redisService } from '@src/services/cache/redis.service'
import { VerificationService } from './verification.service'

export const verificationService = new VerificationService(redisService)
