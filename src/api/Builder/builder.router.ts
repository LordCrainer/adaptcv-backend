import { Router } from 'express'

import { inyectBuilderController } from './builder.dependencies'

const router = Router()

router.post('/cv', inyectBuilderController.createCV)
router.get('/cv/:id', inyectBuilderController.getCV)
router.put('/cv/:id', inyectBuilderController.updateCV)
router.delete('/cv/:id', inyectBuilderController.deleteCV)

export default router
