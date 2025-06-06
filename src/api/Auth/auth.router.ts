import { Router } from 'express'

import { inyectAuthController, inyectAuthMiddleware } from './auth.dependencies'

const AuthRouter: Router = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Auth:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         email: test@example.com
 *         password: Password.123
 *     Register:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         name: John Doe
 *         email: john@example.com
 *         password: Password123
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Auth'
 *     responses:
 *       201:
 *         description: The created user
 *       400:
 *         description: Bad request
 */
AuthRouter.post('/signup', inyectAuthController.signup)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Auth'
 *     responses:
 *       200:
 *         description: The authenticated user
 *       401:
 *         description: Unauthorized
 */
AuthRouter.post('/login', inyectAuthController.login)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: The user has been logged out
 *       401:
 *         description: Unauthorized
 */
AuthRouter.post('/logout', inyectAuthMiddleware, inyectAuthController.logout)

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh the authentication token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: The new authentication token
 *       401:
 *         description: Unauthorized
 */
AuthRouter.post('/refresh-token', inyectAuthController.refreshToken)

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: User registered successfully, verification email sent
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: Email already registered
 */
AuthRouter.post('/register', inyectAuthController.register)

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verify user email with token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
AuthRouter.get('/verify-email', inyectAuthController.verifyEmail)

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address to resend verification
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
AuthRouter.post('/resend-verification', inyectAuthController.resendVerification)

AuthRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Auth service is running'
  })
})

export default AuthRouter
