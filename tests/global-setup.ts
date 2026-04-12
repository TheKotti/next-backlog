import { readFileSync } from 'fs'
import { join } from 'path'
import { MongoClient, ObjectId } from 'mongodb'

/**
 * Parses a .env file and populates process.env with its values.
 * Existing env vars are not overwritten, matching Next.js precedence rules.
 */
function loadEnvFile(filePath: string) {
    try {
        const content = readFileSync(filePath, 'utf-8')
        for (const line of content.split('\n')) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#')) continue
            const eqIndex = trimmed.indexOf('=')
            if (eqIndex === -1) continue
            const key = trimmed.slice(0, eqIndex).trim()
            let value = trimmed.slice(eqIndex + 1).trim()
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1)
            }
            if (!process.env[key]) {
                process.env[key] = value
            }
        }
    } catch {
        // File doesn't exist; fall back to existing environment variables
    }
}

/**
 * Playwright global setup: seeds the MongoDB database with test data from
 * seed.json before any tests run. The collection is cleared first so tests
 * always work against a known, deterministic dataset.
 */
export default async function globalSetup() {
    // Load env vars from Next.js env files in priority order
    loadEnvFile(join(process.cwd(), '.env.local'))
    loadEnvFile(join(process.cwd(), '.env'))

    const uri = process.env.MONGODB_URI
    const dbName = 'gamesdb-test'

    if (!uri) {
        throw new Error(
            'MONGODB_URI is not set. Add it to .env.local before running tests.'
        )
    }

    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db(dbName)
    const collection = db.collection('games')

    // Read seed data (MongoDB Extended JSON: _id is stored as { "$oid": "..." })
    const seedPath = join(process.cwd(), 'tests', 'seed.json')
    const raw: Array<Record<string, unknown>> = JSON.parse(
        readFileSync(seedPath, 'utf-8')
    )

    const docs = raw.map((doc) => ({
        ...doc,
        _id: new ObjectId((doc._id as { $oid: string }).$oid),
    }))

    await collection.deleteMany({})
    await collection.insertMany(docs)

    await client.close()

    console.log(
        `[global-setup] Seeded ${docs.length} games into "${dbName}".games`
    )
}
