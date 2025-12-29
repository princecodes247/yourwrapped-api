import { collections, db } from '../../db'
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

export const getWrappedStats = async () => {
    const [
        totalWraps,
        users,
        topThemeResult,
        topEraResult,
        topMusicResult,
        themeDistribution,
        musicDistribution,
        topEras,
        wrapsOverTime,
        // results
    ] = await Promise.all([
        collections.wrapped.countDocuments({}),
        db.collection('wrapped').aggregate([
            { $group: { _id: "$userId" } },
            { $count: "count" },
        ]).toArray(),
        db.collection('wrapped').aggregate([
            { $match: { accentTheme: { $exists: true, $ne: null } } },
            { $group: { _id: "$accentTheme", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]).toArray(),
        db.collection('wrapped').aggregate([
            { $match: { mainCharacterEra: { $exists: true, $ne: null } } },
            { $group: { _id: "$mainCharacterEra", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]).toArray(),
        db.collection('wrapped').aggregate([
            { $match: { bgMusic: { $exists: true, $ne: null } } },
            { $group: { _id: "$bgMusic", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]).toArray(),
        db.collection('wrapped').aggregate([
            { $match: { accentTheme: { $exists: true, $ne: null } } },
            { $group: { _id: "$accentTheme", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray(),
        db.collection('wrapped').aggregate([
            { $match: { bgMusic: { $exists: true, $ne: null } } },
            { $group: { _id: "$bgMusic", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray(),
        db.collection('wrapped').aggregate([
            { $match: { mainCharacterEra: { $exists: true, $ne: null } } },
            { $group: { _id: "$mainCharacterEra", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray(),
        db.collection('wrapped').aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$createdAt" } }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray(),
        // db.collection('wrapped').find({}).sort({ createdAt: -1 }).toArray()
    ])

    return {
        totalWraps,
        users,
        topTheme: topThemeResult[0] || null,
        topEra: topEraResult[0] || null,
        topMusic: topMusicResult[0] || null,
        themeDistribution,
        musicDistribution,
        topEras,
        wrapsOverTime,
        // results
    }
}

export const getWraps = async (params: { limit: number; cursor?: string; sort: 'asc' | 'desc' }) => {
    const { limit, cursor, sort } = params
    const query: any = {}

    if (cursor) {
        const cursorDate = new Date(cursor)
        if (!isNaN(cursorDate.getTime())) {
            query.createdAt = sort === 'desc' ? { $lt: cursorDate } : { $gt: cursorDate }
        }
    }

    const items = await collections.wrapped.find(query)
        .sort({ createdAt: sort === 'desc' ? -1 : 1 })
        .limit(limit + 1) // Fetch one extra to check for next page


    const hasNextPage = items.length > limit
    const edges = hasNextPage ? items.slice(0, limit) : items

    return {
        items: edges,
        nextCursor: hasNextPage ? edges[edges.length - 1]?.createdAt : null,
        hasNextPage
    }
}