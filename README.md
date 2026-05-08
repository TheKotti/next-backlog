# next-backlog

A personal game backlog tracker. Displays a list of previously played games with ratings and stats, and a backlog of upcoming games. Visitors can sign in with Twitch to vote for which backlog game gets played next.

## Architecture

**Framework:** Next.js 15 (App Router) deployed on Vercel  
**Database:** MongoDB (direct driver, no ORM)  
**Auth:** NextAuth v5 with Twitch OAuth  
**Images:** Cloudinary (cover art)  
**Game metadata:** IGDB API  

### Rendering strategy

The public home page (`/`) is statically rendered and only rebuilds when the admin clicks the **Revalidate** button. This keeps Vercel ISR write usage minimal and page loads fast.

Vote counts are the exception — they are fetched client-side via `GET /api/votes` on page load, so they stay live without triggering a revalidation.

### Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Game list — previously played and backlog |
| `/admin` | Admin only | Edit games, manage the list |
| `/add-game` | Admin only | Search IGDB and add a new game |
| `/recap` | Admin only | Per-game recap editor |

### Key files

```
app/
  page.tsx          # Public home page (static render)
  auth.ts           # NextAuth config (Twitch OAuth)
  actions.ts        # Server actions: edit games, vote, revalidate
  api/votes/        # GET /api/votes — live vote counts

components/
  NavWrapper.tsx    # Server component — reads auth state, renders Nav
  Nav.tsx           # Client nav: sign in/out, admin links
  Tables.tsx        # Fetches live votes, renders played/backlog tables
  BacklogTable.tsx  # Backlog grid with cover images and vote badges
  VoteBadge.tsx     # Vote button and count per game

lib/
  mongo.ts          # MongoDB connection with caching

types.d.ts          # Game type definition
```

### Data model

Games are stored as documents in the `games` MongoDB collection. The `votes` field is an array of Twitch usernames who have voted for that game.

Admin status is determined by comparing the authenticated user's Twitch username against the `ADMIN_USER_NAME` environment variable.

## Development

### Prerequisites

- Node.js 18+
- A MongoDB database
- A Twitch application (for OAuth and IGDB access)
- A Cloudinary account (for cover image uploads)

### Environment variables

Create a `.env.local` file:

```
MONGODB_URI=
DB_NAME=
ADMIN_USER_NAME=        # Your Twitch username
TWITCH_CLIENT_ID=       # From dev.twitch.tv/console/apps
TWITCH_CLIENT_SECRET=
NEXTAUTH_SECRET=        # Any random string, e.g. output of: openssl rand -hex 32
NEXT_PUBLIC_IMG_CLOUD_NAME=
IMG_API_KEY=
IMG_API_SECRET=
```

The Twitch application needs `http://localhost:3000/api/auth/callback/twitch` added as an OAuth redirect URL in the Twitch developer console.

### Running locally

```bash
npm install
npm run dev       # starts on http://localhost:3000 with Turbopack
```

### Other commands

```bash
npm run build     # production build
npm run lint      # ESLint
npm run format    # Prettier (ts, tsx, css)
npx playwright test  # end-to-end tests
```

## Deployment

The app is deployed on Vercel. Automatic git deployments are disabled (`vercel.json`) — deploy manually via the Vercel dashboard or CLI.

The public home page is statically cached. After editing game data in the admin panel, click **Revalidate** to rebuild the public page.
