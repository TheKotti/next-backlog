import NextAuth from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'

const realProviders = [
    TwitchProvider({
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
    }),
]
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: realProviders,
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.access_token = account?.access_token
                token.refresh_token = account?.refresh_token
            }
            if (profile) {
                token.name = profile.preferred_username ?? profile.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.name = token.name as string
            }
            return session
        },
    },
})
