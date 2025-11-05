import NextAuth, { User } from "next-auth"
import TwitchProvider from "next-auth/providers/twitch"
import CredentialsProvider from "next-auth/providers/credentials"

const realProviders: any = [
    TwitchProvider({
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET
    })
]

const testProviders: any = [
    CredentialsProvider({
        name: 'Credentials',
        async authorize(_credentials, _req): Promise<User> {
            return {
                id: "111",
                name: "testuser"
            }
        }
    })
]

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: process.env.ADMIN_USER_NAME == "testuser" ? testProviders : realProviders,
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.access_token = account?.access_token
                token.refresh_token = account?.refresh_token
            }
            return token
        },
    },
})
