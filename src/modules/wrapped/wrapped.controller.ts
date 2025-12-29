import type { Request, Response } from 'express'
import { asyncHandler } from '../../lib/utils'
import * as wrappedService from './wrapped.service'

import { randomUUID } from 'crypto'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '../../lib/s3'
import env from '../../config'
import type { Readable } from 'stream'

export const createWrapped = async (req: Request, res: Response) => {
    let userId = req.cookies.userId

    if (!userId) {
        userId = randomUUID()
        res.cookie('userId', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
            sameSite: 'lax'
        })
    }

    const wrapped = await wrappedService.createWrapped({
        ...req.body,
        userId
    })
    res.status(201).json(wrapped)
}

export const getWrapped = async (req: Request, res: Response) => {
    const { slug } = req.params
    if (!slug) {
        res.status(400).json({ message: 'Slug is required' })
        return
    }
    const wrapped = await wrappedService.getWrappedBySlug(slug)
    if (!wrapped) {
        res.status(404).json({ message: 'Wrapped not found' })
        return
    }
    res.json(wrapped)
}

export const getAllWrapped = async (req: Request, res: Response) => {
    const wrapped = await wrappedService.getAllWrapped()
    res.json(wrapped)
}

export const uploadImage = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' })
        return
    }

    // With multer-s3, the file object has a 'location' property with the S3 URL
    // We need to cast req.file to any because Express.Multer.File doesn't have 'location' by default
    const file = req.file as any
    // const fileUrl = file.location

    // Return a proxy URL instead of the direct S3 URL
    const fileUrl = `/wrapped/image?key=${file.key}`

    res.json({
        url: fileUrl,
        filename: file.key, // multer-s3 uses 'key' instead of 'filename'
        mimetype: file.mimetype,
        size: file.size
    })
}

export const getImage = async (req: Request, res: Response) => {
    const key = req?.query?.key // Capture everything after /image/
    if (!key) {
        res.status(400).json({ message: 'Image key is required' })
        return
    }

    try {
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
        })

        const response = await s3.send(command)

        if (response.ContentType) {
            res.setHeader('Content-Type', response.ContentType)
        }
        if (response.ContentLength) {
            res.setHeader('Content-Length', response.ContentLength)
        }

        // Cache control for better performance
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

        // Stream the response body to the client
        if (response.Body) {
            const stream = response.Body as Readable
            stream.pipe(res)
        } else {
            res.status(404).json({ message: 'Image not found' })
        }
    } catch (error: any) {
        if (error.name === 'NoSuchKey') {
            res.status(404).json({ message: 'Image not found' })
        } else {
            console.error('Error fetching image from S3:', error)
            res.status(500).json({ message: 'Error fetching image' })
        }
    }
}
