import type { Request, Response, NextFunction } from 'express'

/**
 * Global error handler middleware.
 * Must have 4 parameters for Express to recognize it as an error handler.
 */
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Unhandled Error:', err.message)
  console.error(err.stack)

  const statusCode = (err as any).statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    data: null,
    error: message,
    meta: null,
  })
}
