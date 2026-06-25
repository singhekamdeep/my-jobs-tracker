import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  REFRESH_JWT_SECRET: z.string(),
  CLIENT_URL: z.string(),
  NODE_ENV: z.string().default('development'),
  GEMINI_API_KEY: z.string(),
  ARCJET_KEY: z.string(),
})

type EnvConfig = z.infer<typeof envSchema>

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const ENV: EnvConfig = parsed.data