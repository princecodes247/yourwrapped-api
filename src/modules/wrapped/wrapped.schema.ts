import { createSchema, type InferSchemaInput, type InferSchemaOutput } from 'monarch-orm'
import {
    array,
    boolean,
    createdAt,
    number,
    mixed,
    string,
    updatedAt,
    literal,
    object
} from 'monarch-orm/types'
import { randomUUID } from 'crypto'
import { generateId } from '../../lib/utils'

export const Wrapped = createSchema('wrapped', {
    slug: string().default(() => generateId('w_', 18)), // unguessable

    recipientName: string(),
    // relationship: literal('partner', 'friend', 'bestie', 'family'),
    relationship: literal('partner', 'other', 'best-friend', 'friend', 'sibling', 'parent', 'child', 'enemy'),

    accentTheme: string().default('default'),
    bgMusic: string().default('none'),
    year: number().default(new Date().getFullYear()),

    mainCharacterEra: string().optional(),
    eraVariant: string().optional(),
    topPhrase: string().optional(),
    phraseVariant: string().optional(),
    topEmotions: array(object({
        id: string(),
        percentage: number().optional(),
    })).optional(),
    emotionsVariant: string().optional(),
    obsessions: array(string()).optional(),
    obsessionsVariant: string().optional(),
    favorites: array(string()).optional(),
    favoritesVariant: string().optional(),
    quietImprovement: array(string()).optional(),
    improvementVariant: string().optional(),
    outroMessage: string().optional(),
    outroVariant: string().optional(),
    creatorName: string().optional(),
    creatorVariant: string().optional(),

    userId: string().optional(),

    isPremium: boolean().default(false),
    premiumUnlockedAt: number().nullable().optional(), // Unix timestamp

    createdAt: createdAt(),
    updatedAt: updatedAt(),
}).indexes(({ unique }) => ({
    slug: unique('slug'),
}))

export type WrappedInput = InferSchemaInput<typeof Wrapped>
export type WrappedOutput = InferSchemaOutput<typeof Wrapped>
