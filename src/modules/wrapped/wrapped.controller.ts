import type { Request, Response } from 'express'
import { asyncHandler } from '../../lib/utils'
import * as wrappedService from './wrapped.service'

import { randomUUID } from 'crypto'

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
