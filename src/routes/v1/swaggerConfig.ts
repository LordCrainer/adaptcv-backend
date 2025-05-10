import { Router } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const swaggerRouterV1 = Router()

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Users service'
  },
  servers: [
    {
      url: 'http://localhost:3002/v1',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
}

const options = {
  swaggerDefinition,
  apis: ['./src/api/Auth/auth.router.ts', './src/api/Users/users.router.ts']
}

const swaggerSpec = swaggerJSDoc(options)

swaggerRouterV1.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export default swaggerRouterV1
