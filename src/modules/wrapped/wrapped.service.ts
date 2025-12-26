import { collections } from '../../db'
import type { WrappedInput } from './wrapped.schema'

export const createWrapped = async (input: WrappedInput) => {
    const wrapped = await collections.wrapped.insertOne(input)
    return wrapped
}

export const getWrappedBySlug = async (slug: string) => {
    const wrapped = await collections.wrapped.findOne({ slug })
    return wrapped
}

export const getWrappedById = async (id: string) => {
    const wrapped = await collections.wrapped.findOne({ id })
    return wrapped
}