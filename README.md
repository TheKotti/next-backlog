This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Games API

`GET /api/games?title=<title>` returns the most recent backlog entry whose title
matches, as JSON.

### Authentication

Send the token from the `API_TOKEN` environment variable as a bearer token:

```bash
curl -H "Authorization: Bearer $API_TOKEN" \
  'https://<host>/api/games?title=Doom%20Eternal'
```

### Matching

The `title` parameter is matched exactly but case-insensitively, so `doom
eternal` finds `DOOM Eternal` while `doom` does not. When several entries share
a title the most recently finished one wins; entries that aren't finished yet
sort last.

### Responses

| Status | Body              | Meaning                                   |
| ------ | ----------------- | ----------------------------------------- |
| 200    | The game document | A matching entry was found                |
| 400    | `{ error: ... }`  | The `title` parameter is missing or empty |
| 401    | `{ error: ... }`  | The bearer token is missing or incorrect  |
| 404    | `{ error: ... }`  | No entry matched the title                |
| 500    | `{ error: ... }`  | `API_TOKEN` is unset, or the query failed |

A 200 response is the raw game document — see the `Game` type in `types.d.ts`
for its shape.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
