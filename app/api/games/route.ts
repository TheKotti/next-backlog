import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/mongo'

export const revalidate = 300

const RATE_LIMIT = 60
const RATE_WINDOW = 60_000

const rateLimitMap = new Map<string, { count: number; windowStart: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)
    if (!entry || now - entry.windowStart > RATE_WINDOW) {
        rateLimitMap.set(ip, { count: 1, windowStart: now })
        return true
    }
    if (entry.count >= RATE_LIMIT) return false
    entry.count++
    return true
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sanitizeString(val: string | null, maxLen: number): string | null {
    if (val === null) return null
    const trimmed = val.trim()
    return trimmed.length === 0 ? null : trimmed.slice(0, maxLen)
}

function parseIntParam(
    val: string | null,
    min: number,
    max: number,
    def: number | undefined
): { value: number | undefined; error: string | null } {
    if (val === null) return { value: def, error: null }
    const parsed = parseInt(val, 10)
    if (isNaN(parsed)) return { value: undefined, error: `expected an integer, got "${val}"` }
    if (parsed < min || parsed > max) return { value: undefined, error: `must be between ${min} and ${max}` }
    return { value: parsed, error: null }
}

const FINISHED_ALLOWLIST = new Set(['Yes', 'No', 'Happening', ''])

const PROJECTION = {
    _id: 1,
    title: 1,
    rating: 1,
    platform: 1,
    finishedDate: 1,
    releaseYear: 1,
    developers: 1,
    tags: 1,
    keywords: 1,
    comment: 1,
    coverImageId: 1,
    igdbUrl: 1,
    finished: 1,
    streamed: 1,
    timeSpent: 1,
}

export async function GET(request: NextRequest) {
    const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429, headers: { 'Retry-After': '60' } }
        )
    }

    const sp = request.nextUrl.searchParams

    const q = sanitizeString(sp.get('q'), 100)
    const platform = sanitizeString(sp.get('platform'), 60)
    const tagRaw = sanitizeString(sp.get('tag'), 60)
    const tag = tagRaw ? tagRaw.toLowerCase() : null
    const developer = sanitizeString(sp.get('developer'), 100)

    const limitResult = parseIntParam(sp.get('limit'), 1, 100, 50)
    if (limitResult.error) {
        return NextResponse.json({ error: `limit: ${limitResult.error}` }, { status: 400 })
    }
    const limit = limitResult.value!

    const offsetResult = parseIntParam(sp.get('offset'), 0, 1_000_000, 0)
    if (offsetResult.error) {
        return NextResponse.json({ error: `offset: ${offsetResult.error}` }, { status: 400 })
    }
    const offset = offsetResult.value!

    const minRatingResult = parseIntParam(sp.get('minRating'), 1, 10, undefined)
    if (minRatingResult.error) {
        return NextResponse.json({ error: `minRating: ${minRatingResult.error}` }, { status: 400 })
    }

    const maxRatingResult = parseIntParam(sp.get('maxRating'), 1, 10, undefined)
    if (maxRatingResult.error) {
        return NextResponse.json({ error: `maxRating: ${maxRatingResult.error}` }, { status: 400 })
    }

    if (
        minRatingResult.value !== undefined &&
        maxRatingResult.value !== undefined &&
        maxRatingResult.value < minRatingResult.value
    ) {
        return NextResponse.json({ error: 'maxRating must be >= minRating' }, { status: 400 })
    }

    const yearResult = parseIntParam(sp.get('year'), 1970, 2030, undefined)
    if (yearResult.error) {
        return NextResponse.json({ error: `year: ${yearResult.error}` }, { status: 400 })
    }

    const finishedRaw = sp.get('finished')
    if (finishedRaw !== null && !FINISHED_ALLOWLIST.has(finishedRaw)) {
        return NextResponse.json(
            { error: 'finished must be one of: Yes, No, Happening, or empty string' },
            { status: 400 }
        )
    }

    const filter: Record<string, unknown> = {}

    if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' }
    if (platform) filter.platform = platform
    if (tag) filter.tags = tag
    if (developer) filter.developers = { $regex: `^${escapeRegex(developer)}$`, $options: 'i' }

    if (minRatingResult.value !== undefined || maxRatingResult.value !== undefined) {
        const ratingFilter: Record<string, number> = {}
        if (minRatingResult.value !== undefined) ratingFilter.$gte = minRatingResult.value
        if (maxRatingResult.value !== undefined) ratingFilter.$lte = maxRatingResult.value
        filter.rating = ratingFilter
    }

    if (yearResult.value !== undefined) filter.releaseYear = yearResult.value
    if (finishedRaw !== null) filter.finished = finishedRaw

    try {
        const { db } = await connectToDatabase()
        const collection = db.collection('games')

        const [total, rawGames] = await Promise.all([
            collection.countDocuments(filter),
            collection.find(filter, { projection: PROJECTION }).skip(offset).limit(limit).toArray(),
        ])

        const data = rawGames.map((g) => ({
            id: g._id.toString(),
            title: g.title,
            rating: g.rating ?? null,
            platform: g.platform ?? null,
            finishedDate: g.finishedDate ?? null,
            releaseYear: g.releaseYear ?? null,
            developers: g.developers ?? [],
            tags: g.tags ?? [],
            keywords: g.keywords ?? [],
            comment: g.comment ?? null,
            coverImageId: g.coverImageId ?? null,
            igdbUrl: g.igdbUrl ?? null,
            finished: g.finished ?? null,
            streamed: g.streamed ?? null,
            timeSpent: g.timeSpent ?? null,
        }))

        return NextResponse.json(
            { total, limit, offset, data },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
                },
            }
        )
    } catch (err) {
        console.error('[GET /api/games] DB error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
