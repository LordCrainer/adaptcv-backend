import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'

import { redisClient } from '@src/config/cache/redis'

const healthRouter = Router()

/**
 * Global Infrastructure Health Check Endpoint
 * 
 * This endpoint checks the health of critical infrastructure dependencies (MongoDB, Redis).
 * It is designed for external monitoring services like UptimeRobot.
 * 
 * Note: This is different from service-specific health endpoints like /v1/auth/health
 * or /v1/users/health, which only check if those API routes are available.
 * 
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and its dependencies (MongoDB and Redis)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         readyState:
 *                           type: number
 *                           example: 1
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [connected, disconnected, not_initialized]
 *                           example: connected
 *       503:
 *         description: One or more services are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 */
healthRouter.get('/', (req: Request, res: Response) => {
  try {
    // Check MongoDB connection status
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const mongoStatus = mongoose.connection.readyState
    const mongoHealthy = mongoStatus === 1

    // Check Redis connection status
    // Check if client exists and is ready
    const redisHealthy = redisClient ? redisClient.isReady : false
    const redisStatusText = !redisClient 
      ? 'not_initialized' 
      : redisHealthy 
        ? 'connected' 
        : 'disconnected'

    // Determine overall health
    const isHealthy = mongoHealthy && redisHealthy

    const healthResponse = {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: {
          status: mongoHealthy ? 'connected' : 'disconnected',
          readyState: mongoStatus
        },
        redis: {
          status: redisStatusText
        }
      }
    }

    const statusCode = isHealthy ? 200 : 503
    res.status(statusCode).json(healthResponse)
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error occurred',
      services: {
        mongodb: {
          status: 'unknown'
        },
        redis: {
          status: 'unknown'
        }
      }
    })
  }
})

export default healthRouter
