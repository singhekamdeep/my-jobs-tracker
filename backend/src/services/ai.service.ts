import { GoogleGenAI, Type } from '@google/genai'
import { ENV } from '../db/env.js'
import { cache } from './cache.service.js'
import crypto from 'crypto'

const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY })

/**
 * The structured output schema for job metadata extraction.
 * The salary field is explicitly instructed to return ONLY the salary range/number.
 */
const jobMetadataSchema = {
  type: Type.OBJECT,
  properties: {
    company_name: {
      type: Type.STRING,
      description: 'The name of the company posting the job',
    },
    role: {
      type: Type.STRING,
      description: 'The job title or role name',
    },
    salary: {
      type: Type.STRING,
      description:
        'ONLY the salary range or specific number (e.g., "$120k - $150k" or "$95,000/year"). If salary is not explicitly mentioned in the job description, return exactly "Not mentioned".',
    },
    location: {
      type: Type.STRING,
      description: 'Job location (city, state, country, or "Remote")',
    },
    job_type: {
      type: Type.STRING,
      description:
        'Employment type: "Full-time", "Part-time", "Contract", "Internship", or "Not mentioned"',
    },
    experience_level: {
      type: Type.STRING,
      description:
        'Required experience level: "Entry", "Mid", "Senior", "Lead", "Staff", "Principal", or "Not mentioned"',
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of key technical skills and technologies mentioned in the job listing',
    },
    summary: {
      type: Type.STRING,
      description: 'A brief 2-3 sentence summary of the job role and key responsibilities',
    },
  },
  required: ['company_name', 'role', 'salary', 'location', 'job_type', 'experience_level', 'skills', 'summary'],
}

export interface ParsedJobMetadata {
  company_name: string
  role: string
  salary: string
  location: string
  job_type: string
  experience_level: string
  skills: string[]
  summary: string
}

/**
 * Extract structured job metadata from raw scraped job listing text.
 * Uses Gemini 2.5 Flash with structured JSON output.
 * Results are cached for 1 hour keyed by content hash.
 */
export async function extractJobMetadata(rawText: string): Promise<ParsedJobMetadata> {
  // Generate a hash of the raw text for cache key
  const contentHash = crypto.createHash('sha256').update(rawText).digest('hex')
  const cacheKey = `job_metadata:${contentHash}`

  // Check cache first
  const cached = cache.get<ParsedJobMetadata>(cacheKey)
  if (cached) {
    return cached
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are a job listing parser. Extract structured metadata from the following job listing text.

IMPORTANT RULES:
- For the "salary" field: Return ONLY the salary range or specific number (e.g., "$120k - $150k" or "$95,000/year"). If salary is NOT explicitly mentioned anywhere in the job description, return exactly "Not mentioned". Do NOT include any other text, explanation, or the full AI response — just the salary value itself.
- For all other fields: Extract the most accurate information from the text. If a field is not found, use "Not mentioned".
- For "skills": Extract a list of specific technical skills, programming languages, frameworks, and tools mentioned.

Job Listing Text:
${rawText}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: jobMetadataSchema,
    },
  })

  const text = response.text
  if (!text) {
    throw new Error('Empty response from Gemini API')
  }

  const parsed: ParsedJobMetadata = JSON.parse(text)

  // Cache for 1 hour (3600 seconds)
  cache.set(cacheKey, parsed, 3600)

  return parsed
}
