import jwt from 'jsonwebtoken'
import { ENV } from '../db/env.js'
import type { Request, Response, NextFunction } from 'express'

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

/**
 * Auth middleware that verifies JWT access tokens.
 * Checks Authorization Bearer header first, then falls back to cookies.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined

  // 1. Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  // 2. Fall back to httpOnly cookie
  if (!token) {
    token = req.cookies?.accessToken
  }

  if (!token) {
    res.status(401).json({
      data: null,
      error: 'Access denied. No token provided.',
      meta: null,
    })
    return
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({
      data: null,
      error: 'Invalid or expired token.',
      meta: null,
    })
    return
  }
}
