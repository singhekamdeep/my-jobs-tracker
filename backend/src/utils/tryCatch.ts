import type { Request, Response, NextFunction } from 'express'

/**
 * Wraps an async route handler to catch errors and forward them
 * to Express's error-handling middleware via next().
 */
export const tryCatch = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}
