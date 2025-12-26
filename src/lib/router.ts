import type { NextFunction, Request, RequestHandler, Response } from "express"
import express, { Router } from "express"
import logger from "./logger"

type AsyncController = RequestHandler

type RouterConfig = {
  name?: string
  silent?: boolean
  logger?: typeof console.log
}

const defaultLogger = (message: string) => {

  if (process.env.NODE_ENV !== "test") {
    logger.info(message)
  }
}

export const createRouter = (config?: RouterConfig): Router => {
  const router = express.Router()
  const name = config?.name
  const isSilent = config?.silent ?? false
  const logFn = config?.logger ?? defaultLogger

  const methods: (keyof Router)[] = ["get", "post", "put", "delete", "patch", "all", "options", "head"]

  for (const method of methods) {
    const original = (router as any)[method].bind(router)

      ; (router as any)[method] = (...args: any[]) => {
        const [path, ...handlers] = args

        if (!isSilent) {
          logFn(`[${name ? name + " " : ""}Router] ${method.toUpperCase()} ${JSON.stringify(path)}`)
        }

        return original(path, ...normalizeHandlers(handlers, { name }))
      }
  }

  return router
}

function normalizeHandlers(handlers: any[], config?: RouterConfig): RequestHandler[] {
  const result: RequestHandler[] = []

  for (const h of handlers) {
    if (Array.isArray(h)) {
      result.push(...normalizeHandlers(h, config))
    } else if (typeof h === "function") {
      result.push(asyncHandler(h, config))
    } else {
      throw new Error("Router handler must be a function or array of functions")
    }
  }

  return result
}

export const asyncHandler = (fn: AsyncController, config?: RouterConfig): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!config?.silent) {
        (config?.logger ?? defaultLogger)(
          `[${config?.name ? config?.name + " " : ""}Handler] Executing ${req.method} ${req.path}`
        )
      }
      await fn(req, res, next)
      if (!config?.silent) {
        (config?.logger ?? defaultLogger)(
          `[${config?.name ? config?.name + " " : ""}Handler] Executed ${req.method} ${req.path}`
        )
      }
    } catch (error: any) {
      logger.error(`Error: ${error?.message}`, { error })
      next(error instanceof Error ? error : new Error("An unexpected error occurred"))
    }
  }
}
