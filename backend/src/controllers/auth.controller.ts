import bcrypt from 'bcryptjs'
import { prisma } from '../db/db.js'
import { generateRefreshToken, generateAccessToken } from '../utils/token.js'
import type { Request, Response } from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { ENV } from '../db/env.js'

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({
      data: null,
      error: 'All fields are required',
      meta: null,
    })
    return
  }

  if (password.length < 6) {
    res.status(400).json({
      data: null,
      error: 'Password length must be at least 6 characters',
      meta: null,
    })
    return
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    res.status(400).json({
      data: null,
      error: 'Please enter a valid email',
      meta: null,
    })
    return
  }

  const userExists = await prisma.user.findUnique({
    where: { email },
  })
  if (userExists) {
    res.status(400).json({
      data: null,
      error: 'User already exists',
      meta: null,
    })
    return
  }

  const hashedPwd = await bcrypt.hash(password, 10)
  const id: string = crypto.randomUUID()
  const refreshToken = generateRefreshToken(id, res)
  const hashed_refresh_token = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const accessToken = generateAccessToken(id, res)

  const user = await prisma.user.create({
    data: {
      id,
      email,
      hashedPassword: hashedPwd,
      refresh_token: hashed_refresh_token,
    },
  })

  res.status(201).json({
    data: { id: user.id, email: user.email, accessToken, refreshToken },
    error: null,
    meta: null,
  })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({
      data: null,
      error: 'All fields are required',
      meta: null,
    })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    res.status(401).json({
      data: null,
      error: 'Invalid email or password',
      meta: null,
    })
    return
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
  if (!isPasswordValid) {
    res.status(401).json({
      data: null,
      error: 'Invalid email or password',
      meta: null,
    })
    return
  }

  // Generate new tokens
  const refreshToken = generateRefreshToken(user.id, res)
  const hashed_refresh_token = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const accessToken = generateAccessToken(user.id, res)

  // Update the stored refresh token hash
  await prisma.user.update({
    where: { id: user.id },
    data: { refresh_token: hashed_refresh_token },
  })

  res.status(200).json({
    data: { id: user.id, email: user.email, accessToken, refreshToken },
    error: null,
    meta: null,
  })
}

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken

  // If there's a refresh token, clear it from DB
  if (refreshToken) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex')
    await prisma.user.updateMany({
      where: { refresh_token: hashedToken },
      data: { refresh_token: null },
    })
  }

  // Clear both cookies
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: ENV.NODE_ENV !== 'development',
  })
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: ENV.NODE_ENV !== 'development',
  })

  res.status(200).json({
    data: { message: 'Logged out successfully' },
    error: null,
    meta: null,
  })
}

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken

  if (!refreshToken) {
    res.status(401).json({
      data: null,
      error: 'No refresh token provided',
      meta: null,
    })
    return
  }

  // Verify the refresh token JWT
  let decoded: { userId: string }
  try {
    decoded = jwt.verify(refreshToken, ENV.REFRESH_JWT_SECRET) as { userId: string }
  } catch {
    res.status(401).json({
      data: null,
      error: 'Invalid or expired refresh token',
      meta: null,
    })
    return
  }

  // Check if the hashed refresh token matches the stored one
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  })

  if (!user || user.refresh_token !== hashedToken) {
    res.status(401).json({
      data: null,
      error: 'Invalid refresh token',
      meta: null,
    })
    return
  }

  // Rotate: generate new tokens
  const newRefresh = generateRefreshToken(user.id, res)
  const newHashedRefresh = crypto.createHash('sha256').update(newRefresh).digest('hex')
  const accessToken = generateAccessToken(user.id, res)

  // Update stored hash
  await prisma.user.update({
    where: { id: user.id },
    data: { refresh_token: newHashedRefresh },
  })

  res.status(200).json({
    data: { id: user.id, email: user.email, accessToken, refreshToken: newRefresh },
    error: null,
    meta: null,
  })
}