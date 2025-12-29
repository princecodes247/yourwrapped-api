import cors from 'cors'
import type { NextFunction, Request, Response, Router } from 'express'
import express from 'express'
import cookieParser from "cookie-parser";
import { AppError } from './lib/errors/app-error'
import { errorHandler } from './lib/errors/error-handler'
import logger from './lib/logger'

export const setupApp = (...routes: { path: string; router: Router }[]) => {
  const app = express()
  app.use(cookieParser());
  app.use(
    cors({
      // origin: ["http://lvh.me:3000"],
      origin: ["http://localhost:5173", "https://yourwrapped.com", "https://www.yourwrapped.com"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  app.options('/{*splat}', cors())
  // Create API router to handle all API routes
  const apiRouter = express.Router()


  // Ping route for health checks
  apiRouter.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'api pong' })
  })
  // Ping route for webhook test
  apiRouter.post('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'api pong', body: req.body })
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/uploads', express.static('uploads'))
  // app.use(express.raw({ type: '*/*', limit: '20mb' }));

  // Mount all routes under the API router
  for (const route of routes) {
    apiRouter.use(route.path, route.router)
  }

  // 404 error route for API paths
  apiRouter.use('/{*splat}', (req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found',
    })
  })

  // Mount the API router under /api
  app.use('/api', apiRouter)

  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' })
  })

  app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
    logger.error(err.message)
    if (err instanceof AppError) {
      if (err.isCatastrophic === undefined || err.isCatastrophic === null) {
        err.isCatastrophic = true // Error during a specific request is usually not fatal and should not lead to process exit
      }

      const errorRes = await errorHandler.handleError(err)
      res.status(errorRes?.status || 500).json(errorRes)
      return
    }
    res.status(500).json({
      message: err.message || 'An internal server error occurred',
    })
  })

  // Initialize event listeners
  logger.info('Application event listeners initialized')

  return app
}
