import arcjet, { slidingWindow } from '@arcjet/node'
import { ENV } from '../db/env.js'
import type { Request, Response, NextFunction } from 'express'

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    slidingWindow({
      mode: 'LIVE',
      interval: '15m',
      max: 100,
    }),
  ],
})

/**
 * Rate limiting middleware using Arcjet sliding window.
 * 100 requests per 15 minutes per IP.
 */
export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const decision = await aj.protect(req)

    if (decision.isDenied()) {
      res.status(429).json({
        data: null,
        error: 'Too many requests. Please try again later.',
        meta: {
          retryAfter: '15 minutes',
        },
      })
      return
    }

    next()
  } catch (error) {
    // If Arcjet is unavailable (e.g. bad key), let requests through
    console.warn('⚠️ Arcjet rate limiting unavailable:', (error as Error).message)
    next()
  }
}
