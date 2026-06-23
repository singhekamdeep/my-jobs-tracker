import express from 'express'
import { signup, login, logout, refresh } from '../controllers/auth.controller.js'
import { tryCatch } from '../utils/tryCatch.js'

const router = express.Router()

router.post('/signup', tryCatch(signup))
router.post('/login', tryCatch(login))
router.post('/logout', tryCatch(logout))
router.post('/refresh', tryCatch(refresh))

export default router