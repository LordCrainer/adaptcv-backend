import { Router } from 'express'

import { inyectAuthMiddleware } from '../Auth/auth.dependencies'
import { inyectBuilderController } from './builder.dependencies'

const BuilderRouter = Router()
  .use(inyectAuthMiddleware)
  .post('/builder', inyectBuilderController.createBuilder)
  .get('/builder/:builderId', inyectBuilderController.getBuilder)
  .put('/builder/:builderId', inyectBuilderController.updateBuilder)
  .delete('/builder/:builderId', inyectBuilderController.deleteBuilder)

export default BuilderRouter
