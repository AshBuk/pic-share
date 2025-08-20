# PicShare

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://pics-share.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-black?style=for-the-badge)](https://ui.shadcn.com/)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

**🔗 [View Live Application](https://pics-share.vercel.app)**

**[https://vercel.com/asher-buk-projects/v0-pic-share](https://vercel.com/asher-buk-projects/v0-pic-share)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/3s6N0OEFE7t](https://v0.app/chat/projects/3s6N0OEFE7t)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local development

1) Prerequisites

- Node.js 18.18+ and npm 9+
- A Supabase project (URL + anon key)

2) Environment variables

Create a `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# Optional: used for auth email confirmation redirect in dev
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

Also add both `http://localhost:3000` and your production domain to Supabase Auth → URL Configuration (redirects and allowed origins).

3) Database setup (run in Supabase SQL editor)

Run these scripts in order:

- `scripts/01-create-tables.sql`
- `scripts/02-create-storage-bucket.sql`
- `scripts/03-create-functions.sql`
- `scripts/05-enable-realtime.sql`

Notes:

- `01-create-tables.sql` assumes `pgcrypto` is enabled (added in the script).
- The previous `ALTER DATABASE ... app.jwt_secret` is not required on hosted Supabase and has been removed.

4) Start the app

```
npm install
npm run dev
```

The app will be available on `http://localhost:3000`.

### Seed demo content (optional)

Populate real demo users (Jewish names in English), posts with real images, likes and comments:

1. Ensure env variables:
   - `SUPABASE_URL` (or reuse `NEXT_PUBLIC_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run:
```
node scripts/06-seed-demo.mjs
```
This will create users like David Cohen, Rivka Levi, etc., upload images to the `images` bucket, and generate likes/comments. All data uses real Supabase tables so you can like and comment interactively.

## Deploy to Vercel

1) Push this repo to GitHub and import it in Vercel
2) Set Environment Variables in Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optionally set `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your production URL. Make sure the same URL is whitelisted in Supabase Auth.

3) Deploy. No extra build settings are required. Images are served unoptimized by Next.js per `next.config.mjs`.

## Post-deploy checklist

- In Supabase Storage, ensure bucket `images` exists and is public (script `02-...` does this)
- In Supabase Realtime, ensure `posts`, `likes`, and `comments` are in the `supabase_realtime` publication (script `05-...`)
 