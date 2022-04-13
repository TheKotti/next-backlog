import { MongoClient, MongoClientOptions } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.DB_NAME

// check the MongoDB URI
if (!MONGODB_URI) {
  throw new Error('Define the MONGODB_URI environmental variable')
}

// check the MongoDB DB
if (!MONGODB_DB) {
  throw new Error('Define the MONGODB_DB environmental variable')
}

let cachedClient
let cachedDb

export async function connectToDatabase() {
  // check the cached.
  if (cachedClient && cachedDb) {
    // load from cache
    return {
      client: cachedClient,
      db: cachedDb,
    }
  }

  // set the connection options
  const opts: MongoClientOptions = {}

  // Connect to cluster
  let client = new MongoClient(MONGODB_URI!, opts)
  await client.connect()
  let db = client.db(MONGODB_DB)

  // set cache
  cachedClient = client
  cachedDb = db

  return {
    client: cachedClient,
    db: cachedDb,
  }
}
