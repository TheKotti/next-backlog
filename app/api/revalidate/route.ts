import { revalidatePath } from 'next/cache'

export async function POST(req, res) {
  // Check for secret to confirm this is a valid request
  const body = await req.json()
  if (body.secret !== process.env.ADMIN_USER_NAME) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    //await res.revalidate('/')
    await revalidatePath('/goty')
    return Response.json({ revalidated: true })
  } catch (err) {
    console.log('REVALIDATION ERROR', err)
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return Response.json({error: err})
  }
}
