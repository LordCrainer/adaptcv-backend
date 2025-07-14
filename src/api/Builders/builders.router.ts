/**
 * @swagger
 * tags:
 *   name: Builder
 *   description: Builder management
 */

import { Router } from 'express'

import { inyectAuthMiddleware } from '../Auth/auth.dependencies'
import { inyectBuilderController } from './builders.dependencies'
import { builderAccess } from './permissions/builders.access'

const BuilderRouter = Router()
  .use(inyectAuthMiddleware) // Solo autenticación, builderAccess maneja los roles

  /**
   * @swagger
   * /builders:
   *   post:
   *     summary: Create a new builder
   *     tags: [Builder]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Builder'
   *     responses:
   *       201:
   *         description: The created builder
   *       400:
   *         description: Bad request
   */
  .post('/', builderAccess.create, inyectBuilderController.createBuilder)

  /**
   * @swagger
   * /builders:
   *   get:
   *     summary: Get all builders
   *     tags: [Builder]
   *     responses:
   *       200:
   *         description: List of builders
   */
  .get('/', builderAccess.list, inyectBuilderController.getBuilders)

  /**
   * @swagger
   * /builders/{builderId}:
   *   get:
   *     summary: Get a builder by ID
   *     tags: [Builder]
   *     parameters:
   *       - in: path
   *         name: builderId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the builder
   *     responses:
   *       200:
   *         description: The builder details
   *       404:
   *         description: Builder not found
   */
  .get('/:builderId', builderAccess.get, inyectBuilderController.getBuilder)

  /**
   * @swagger
   * /builders/{builderId}:
   *   put:
   *     summary: Update a builder by ID
   *     tags: [Builder]
   *     parameters:
   *       - in: path
   *         name: builderId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the builder
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Builder'
   *     responses:
   *       200:
   *         description: The updated builder
   *       404:
   *         description: Builder not found
   */
  .put(
    '/:builderId',
    builderAccess.update,
    inyectBuilderController.updateBuilder
  )

  /**
   * @swagger
   * /builders/{builderId}:
   *   delete:
   *     summary: Delete a builder by ID
   *     tags: [Builder]
   *     parameters:
   *       - in: path
   *         name: builderId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the builder
   *     responses:
   *       200:
   *         description: Builder deleted
   *       404:
   *         description: Builder not found
   */
  .delete(
    '/:builderId',
    builderAccess.delete,
    inyectBuilderController.deleteBuilder
  )

  /**
   * @swagger
   * /builders/{builderId}/duplicate:
   *   post:
   *     summary: Duplicate a builder by ID
   *     tags: [Builder]
   *     parameters:
   *       - in: path
   *         name: builderId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the builder to duplicate
   *     responses:
   *       201:
   *         description: Builder duplicated
   *       404:
   *         description: Builder not found
   */
  .post(
    '/:builderId/duplicate',
    builderAccess.get,
    inyectBuilderController.duplicateBuilder
  )

export default BuilderRouter
