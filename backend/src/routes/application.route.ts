import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { tryCatch } from '../utils/tryCatch.js'
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  reExtractMetadata,
} from '../controllers/application.controller.js'

const router = express.Router()

// All application routes require authentication
router.use(authMiddleware)

router.post('/', tryCatch(createApplication))
router.get('/', tryCatch(getApplications))
router.get('/:id', tryCatch(getApplicationById))
router.patch('/:id', tryCatch(updateApplication))
router.delete('/:id', tryCatch(deleteApplication))
router.post('/:id/extract', tryCatch(reExtractMetadata))

export default router
