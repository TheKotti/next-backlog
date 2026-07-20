import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/mongo'

// Compare via fixed-length digests so the check is timing-safe regardless of
// the length of the token the caller sent.
function isValidToken(provided: string, expected: string) {
    const a = createHash('sha256').update(provided).digest()
    const b = createHash('sha256').update(expected).digest()
    return timingSafeEqual(a, b)
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(request: NextRequest) {
    const apiToken = process.env.API_TOKEN
    if (!apiToken) {
        console.log('Define the API_TOKEN environmental variable')
        return NextResponse.json(
            { error: 'Server misconfigured' },
            { status: 500 }
        )
    }

    const authHeader = request.headers.get('authorization') ?? ''
    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token || !isValidToken(token, apiToken)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const title = request.nextUrl.searchParams.get('title')?.trim()
    if (!title) {
        return NextResponse.json(
            { error: 'Missing required query parameter: title' },
            { status: 400 }
        )
    }

    try {
        const { db } = await connectToDatabase()
        const game: Game | null = await db.collection('games').findOne(
            { title: new RegExp(`^${escapeRegex(title)}$`, 'i') },
            // Unfinished entries have a null finishedDate, which sorts after
            // strings in a descending sort. _id breaks ties by insertion order.
            { sort: { finishedDate: -1, _id: -1 } }
        )

        if (!game) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json(game)
    } catch (error) {
        console.log('Error in games API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
