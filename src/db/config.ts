import { createClient } from 'monarch-orm'
import env from '../config'

export const client = createClient(env.MONGODB_URI)
