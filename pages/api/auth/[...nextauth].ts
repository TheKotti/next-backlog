import NextAuth from 'next-auth'
import TwitchProvider from 'next-auth/providers/twitch'

export default NextAuth({
  providers: [
    // Add the following redirect URL into the console http://<your-next-app-url>/api/auth/callback/twitch
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid user:read:email channel:manage:polls',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.userId = token.sub
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account?.access_token
        token.refresh_token = account?.refresh_token
      }
      return token
    },
  },
})
