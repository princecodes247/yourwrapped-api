import type { Request, Response } from 'express'
import { asyncHandler } from '../../lib/utils'
import * as wrappedService from './wrapped.service'

export const createWrapped = async (req: Request, res: Response) => {
    const wrapped = await wrappedService.createWrapped(req.body)
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
