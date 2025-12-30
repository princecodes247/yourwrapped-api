import type { NextFunction, Request, Response } from 'express'
import { randomBytes } from 'crypto'
import jwt from 'jsonwebtoken';
import env from '../config';

export const getQueryParam = (req: Request, param: string) => {
  const target = req.query[param]
  if (!target) return null
  return Array.isArray(target) ? target.join('') : target.toString()
}

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function toBase62(buf: Buffer) {
  let out = ''
  for (const b of buf) out += BASE62[b % 62]
  return out
}
const MIN_LENGTH = 14

export const generateId = (
  prefix = 'u_',
  length = 16
) => {
  if (length < MIN_LENGTH) {
    throw new Error(
      `generateId: length ${length} must be >= ${MIN_LENGTH} to avoid collisions`
    )
  }

  const timePart = Date.now().toString(36).padStart(8, '0')

  const randomLength = length - timePart.length
  const randomBytesNeeded = Math.ceil((randomLength * Math.log2(62)) / 8)

  const randomPart = toBase62(randomBytes(randomBytesNeeded))
    .slice(0, randomLength)

  return `${prefix}${timePart}${randomPart}`

}

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
}

export const sanitizeSensitiveData = (data: any, additionalKeys: string[] = []): any => {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'authorization',
    'accessToken',
    'refreshToken',
    ...additionalKeys
  ].map(k => k.toLowerCase())

  if (Array.isArray(data)) {
    return data.map(item => sanitizeSensitiveData(item, additionalKeys))
  }

  const sanitized: any = {}

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '***'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSensitiveData(value, additionalKeys)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

export const createTokens = (details: { id: string; }) => {
  const accessToken = jwt.sign(details, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRATION }); // 1 day expiration for now

  return {
    accessToken,
  }
}