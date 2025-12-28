import { z } from 'zod'

export const createWrappedSchema = z.object({
    recipientName: z.string().min(1, 'Recipient name is required'),
    relationship: z.enum(['partner', 'other', 'best-friend', 'friend', 'sibling', 'parent', 'child', 'enemy']),
    accentTheme: z.string().min(1, 'Accent theme is required').optional(),
    bgMusic: z.string().min(1, 'Background music is required').optional(),
    year: z.number().int().min(1900).max(2100).default(new Date().getFullYear()),

    mainCharacterEra: z.string().optional(),
    eraVariant: z.string().optional(),
    topPhrase: z.string().optional(),
    phraseVariant: z.string().optional(),
    topEmotions: z.array(z.string()).optional(),
    emotionsVariant: z.string().optional(),
    obsessions: z.array(z.string()).optional(),
    obsessionsVariant: z.string().optional(),
    favorites: z.array(z.string()).optional(),
    favoritesVariant: z.string().optional(),
    quietImprovement: z.string().optional(),
    improvementVariant: z.string().optional(),
    outroMessage: z.string().optional(),
    outroVariant: z.string().optional(),
    creatorName: z.string().optional(),
    creatorVariant: z.string().optional(),

    previewId: z.string().optional(),

    isPremium: z.boolean().optional().default(false),
    premiumUnlockedAt: z.number().optional().nullable(),
})

export type CreateWrappedInput = z.infer<typeof createWrappedSchema>
