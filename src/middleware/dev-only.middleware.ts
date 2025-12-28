import env from '../config'

export const devOnlyMiddleware = (req: any, res: any, next: any) => {
  if (env.NODE_ENV !== 'development') {
    return res.status(403).json({
      error: 'This endpoint is only available in development environment',
    })
  }
  next()
}
