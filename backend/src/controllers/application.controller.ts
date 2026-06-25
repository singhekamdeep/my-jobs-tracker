import { prisma } from '../db/db.js'
import { extractJobMetadata } from '../services/ai.service.js'
import type { Request, Response } from 'express'
import type { ApplicationStatus } from '@prisma/client'

/**
 * Create a new application.
 * Accepts rawScrappedData and optionally status, notes.
 * Runs AI extraction on the raw text to populate parsedMetadata, company_name, and role.
 */
export const createApplication = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { rawScrappedData, status, notes } = req.body

  if (!rawScrappedData || typeof rawScrappedData !== 'string' || rawScrappedData.trim().length === 0) {
    res.status(400).json({
      data: null,
      error: 'rawScrappedData is required and must be a non-empty string',
      meta: null,
    })
    return
  }

  // Extract metadata using Gemini AI
  const metadata = await extractJobMetadata(rawScrappedData)

  const application = await prisma.application.create({
    data: {
      user_id: userId,
      rawScrappedData,
      parsedMetadata: metadata as any,
      company_name: metadata.company_name,
      role: metadata.role,
      status: status || 'SAVED',
      notes: notes || null,
    },
  })

  res.status(201).json({
    data: application,
    error: null,
    meta: null,
  })
}

/**
 * Get all applications for the authenticated user.
 * Supports optional filtering by status and pagination.
 */
export const getApplications = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { status, page = '1', limit = '20', search } = req.query

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20))
  const skip = (pageNum - 1) * limitNum

  // Build where clause
  const where: any = { user_id: userId }
  if (status && typeof status === 'string') {
    where.status = status as ApplicationStatus
  }
  if (search && typeof search === 'string') {
    where.OR = [
      { company_name: { contains: search, mode: 'insensitive' } },
      { role: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.application.count({ where }),
  ])

  res.status(200).json({
    data: applications,
    error: null,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  })
}

/**
 * Get a single application by ID (must belong to the authenticated user).
 */
export const getApplicationById = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { id } = req.params

  const application = await prisma.application.findFirst({
    where: { id, user_id: userId },
  })

  if (!application) {
    res.status(404).json({
      data: null,
      error: 'Application not found',
      meta: null,
    })
    return
  }

  res.status(200).json({
    data: application,
    error: null,
    meta: null,
  })
}

/**
 * Update an application (status, notes, etc.).
 */
export const updateApplication = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { id } = req.params
  const { status, notes, company_name, role } = req.body

  // Verify ownership
  const existing = await prisma.application.findFirst({
    where: { id, user_id: userId },
  })

  if (!existing) {
    res.status(404).json({
      data: null,
      error: 'Application not found',
      meta: null,
    })
    return
  }

  // Build update data — only include fields that were provided
  const updateData: any = {}
  if (status !== undefined) updateData.status = status
  if (notes !== undefined) updateData.notes = notes
  if (company_name !== undefined) updateData.company_name = company_name
  if (role !== undefined) updateData.role = role

  const application = await prisma.application.update({
    where: { id },
    data: updateData,
  })

  res.status(200).json({
    data: application,
    error: null,
    meta: null,
  })
}

/**
 * Delete an application.
 */
export const deleteApplication = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { id } = req.params

  // Verify ownership
  const existing = await prisma.application.findFirst({
    where: { id, user_id: userId },
  })

  if (!existing) {
    res.status(404).json({
      data: null,
      error: 'Application not found',
      meta: null,
    })
    return
  }

  await prisma.application.delete({
    where: { id },
  })

  res.status(200).json({
    data: { message: 'Application deleted successfully' },
    error: null,
    meta: null,
  })
}

/**
 * Re-extract AI metadata from the existing rawScrappedData.
 * Useful when the AI model improves or the user wants to refresh parsed data.
 */
export const reExtractMetadata = async (req: Request, res: Response) => {
  const userId = req.userId!
  const { id } = req.params

  const existing = await prisma.application.findFirst({
    where: { id, user_id: userId },
  })

  if (!existing) {
    res.status(404).json({
      data: null,
      error: 'Application not found',
      meta: null,
    })
    return
  }

  // Re-run AI extraction on the stored raw text
  const metadata = await extractJobMetadata(existing.rawScrappedData)

  const application = await prisma.application.update({
    where: { id },
    data: {
      parsedMetadata: metadata as any,
      company_name: metadata.company_name,
      role: metadata.role,
    },
  })

  res.status(200).json({
    data: application,
    error: null,
    meta: { reExtracted: true },
  })
}
