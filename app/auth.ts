import NextAuth from "next-auth"
import TwitchProvider from "next-auth/providers/twitch"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        TwitchProvider({
            clientId: process.env.TWITCH_CLIENT_ID,
            clientSecret: process.env.TWITCH_CLIENT_SECRET
        })
    ],
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