import { Router } from 'express'

import { inyectBuilderController } from './builder.dependencies'

const router = Router()

router.post('/builder', inyectBuilderController.createBuilder)
router.get('/builder/:builderId', inyectBuilderController.getBuilder)
router.put('/builder/:builderId', inyectBuilderController.updateBuilder)
router.delete('/builder/:builderId', inyectBuilderController.deleteBuilder)

export default router
