'use server'

import { revalidatePath } from 'next/cache'
import { ObjectId } from "mongodb"
import { auth } from "./auth"
const { connectToDatabase } = require('lib/mongo')

export async function revalidateAction() {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username
        if (isAdmin) {
            await revalidatePath('/goty')
            return true
        }
    } catch (error) {
        console.log('Error revalidating:', error)
        return false
    }
}

export async function updateVodsAction(formData: FormData) {
    try {
        const authState = await auth()
        const username = authState?.user?.name ?? ""
        const isAdmin = process.env.ADMIN_USER_NAME === username
        if (isAdmin) {
            const id = String(formData.get('id'))
            const vodsText = String(formData.get('vods'))

            const mongoId = new ObjectId(id)
            const vods = vodsText ? vodsText.split('\n') : null

            // Update data
            const { db } = await connectToDatabase()
            await db.collection('games').updateOne({ _id: mongoId }, { $set: { vods } })

            return true
        }
    } catch (error) {
        console.log('Error in update vods action:', error)
        return false
    }

}