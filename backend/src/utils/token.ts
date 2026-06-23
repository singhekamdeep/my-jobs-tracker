import jwt from 'jsonwebtoken'
import { ENV } from '../db/env.js'
import type { Response } from 'express'

export const generateRefreshToken = (userId: string, res: Response) => {
  const JWT_SECRET = ENV.REFRESH_JWT_SECRET
  if(!JWT_SECRET) throw new Error("JWT secret not provided")
  
  const token = jwt.sign({userId}, JWT_SECRET, {
    expiresIn: "7d"
  })

  res.cookie("refreshToken", token, {
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "development" ? false : true
  })

  return token
}

export const generateAccessToken = (userId: string, res: Response) => {
  const JWT_SECRET = ENV.JWT_SECRET
  if(!JWT_SECRET) throw new Error("JWT secret not provided")
  
  const token = jwt.sign({userId}, JWT_SECRET, {
    expiresIn: "15m"
  })

  res.cookie("accessToken", token, {
    maxAge: 15*60*1000,
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV === "development" ? false : true
  })

  return token
}