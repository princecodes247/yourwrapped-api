import { NextFunction, Request, Response } from 'express'
import { ZodTypeAny } from 'zod'
import logger from '../lib/logger'

export class ValidationError extends Error {
  constructor(
    message: string,
    public details: {
      issues: {
        expected: string;
        code: string;
        path: string[];
        message: string;
      }[]
    },
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const validateRequest = (schema: {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const result = await schema.body.safeParseAsync(req.body)
        if (!result.success) {
          logger.warn('Request body validation failed:', {
            errors: result.error,
          })

          throw new ValidationError('Invalid request body', result.error as any)
        }
        Object.assign(req.body, result.data);
      }

      if (schema.query) {
        const result = await schema.query.safeParseAsync(req.query)
        if (!result.success) {
          logger.warn('Request query validation failed:', {
            errors: result.error,
          })
          throw new ValidationError(
            'Invalid query parameters',
            result.error as any,
          )
        }
        Object.assign(req.query, result.data);
      }

      if (schema.params) {
        const result = await schema.params.safeParseAsync(req.params)
        if (!result.success) {
          logger.warn('Request params validation failed:', {
            errors: result.error,
          })
          throw new ValidationError(
            'Invalid path parameters',
            result.error as any,
          )
        }
        Object.assign(req.params, result.data);
      }

      next()
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          status: 'error',
          message: error.message,
          details: error.details?.issues?.map((err) => ({
            path: err.path.join('.'),
            code: err.code,
            message: err.message,
          })),
        })
        return
      }
      next(error)
    }
  }
}
