import * as dotenv from 'dotenv'
import path from 'node:path'
import { z } from 'zod'
import logger from '../lib/logger'

dotenv.config()

// Define schema using zod for validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default(3001),
  MONGODB_URI: z.string(),
  REDIS_URI: z.string().default('redis://localhost:6379/0'),
  LOG_LEVEL: z.enum(['info', 'warn', 'error', 'debug']).default('info'),
})

// Parse and validate the environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  logger.error('❌ Invalid environment variables:', parsedEnv.error.format())
  process.exit(1) // Exit the application if environment validation fails
}

const env = parsedEnv.data

export default env
