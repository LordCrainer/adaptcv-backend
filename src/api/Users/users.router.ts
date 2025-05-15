import express from 'express'

import { canAccess } from '@src/middleware/canAccess'

import { inyectAuthMiddleware } from '../Auth/auth.dependencies'
import { userPermissions } from './permissions/users.permissions'
import { inyectUserController } from './users.dependencies'

/**
 * @constant {express.Router}
 */
const UsersRouter = express.Router()

UsersRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Users service is running'
  })
})

UsersRouter.use(inyectAuthMiddleware, canAccess('user'))

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         passwordHash:
 *           type: string
 *           description: The hashed password of the user
 *         timezone:
 *           type: string
 *           description: The timezone of the user
 *         isSuperAdmin:
 *           type: boolean
 *           description: Whether the user is a super admin
 *       example:
 *         _id: d5fE_asz
 *         name: John Doe
 *         email: john.doe@example.com
 *         password: password123
 *         passwordHash: hashedpassword123
 *         timezone: GMT
 *         isSuperAdmin: false
 */

/**
 * GET method route
 * @example http://localhost:API_PORT/v1/users/:userId
 */
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
UsersRouter.get(
  '/:userId',
  userPermissions('getUser'),
  inyectUserController.getUser
)

/**
 * GET method route
 * @example http://localhost:API_PORT/v1/users
 *
 */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users per page
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Order by field
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: Filters to apply
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
UsersRouter.get('/', userPermissions('getUsers'), inyectUserController.getUsers)

/**
 * POST method route
 * @example http://localhost:API_PORT/v1/users
 */
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
UsersRouter.post(
  '/',
  userPermissions('createUser'),
  inyectUserController.createUser
)

/**
 * DELETE method route
 * @example  http://localhost:API_PORT/v1/users/:userId
 */
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The user was deleted
 *       404:
 *         description: User not found
 */
UsersRouter.delete(
  '/:userId',
  userPermissions('deleteUser'),
  inyectUserController.deleteUser
)

/**
 * @export {express.Router}
 */
export default UsersRouter
