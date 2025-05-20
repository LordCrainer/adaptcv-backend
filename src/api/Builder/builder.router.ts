import { Router } from 'express'

import { inyectAuthMiddleware } from '../Auth/auth.dependencies'
import { inyectBuilderController } from './builder.dependencies'

const BuilderRouter = Router()
  .use(inyectAuthMiddleware)
  .post('/', inyectBuilderController.createBuilder)
  .get('/:builderId', inyectBuilderController.getBuilder)
  .put('/:builderId', inyectBuilderController.updateBuilder)
  .delete('/:builderId', inyectBuilderController.deleteBuilder)

export default BuilderRouter
