import { Router } from 'express'

import { healthController } from './health.dependencies'

const HealthRouter: Router = Router()

HealthRouter.get('/', healthController.check)

export default HealthRouter