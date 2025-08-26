# 🛠️ Development Guide

## Local Development Setup

### Prerequisites

- Node.js 18.18+ and npm 9+
- A Supabase project (URL + anon key)

### Environment Variables

Create a `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# Optional: used for auth email confirmation redirect in dev
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

Also add both `http://localhost:3000` and your production domain to Supabase Auth → URL Configuration (redirects and allowed origins).

### Database Setup

Run these scripts in order in the Supabase SQL editor:

- `scripts/01-create-tables.sql`
- `scripts/02-create-storage-bucket.sql`
- `scripts/03-create-functions.sql`
- `scripts/05-enable-realtime.sql`

### Start the Application

```bash
npm install
npm run dev
```

The app will be available on `http://localhost:3000`.

### Seed Demo Content (Optional)

Populate real demo users, posts with real images, likes and comments:

1. Ensure env variables:
   - `SUPABASE_URL` (or reuse `NEXT_PUBLIC_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run:

```bash
node scripts/06-seed-demo.mjs
```

This will create users like David Cohen, Rivka Levi, etc., upload images to the `images` bucket, and generate likes/comments. All data uses real Supabase tables so you can like and comment interactively.

## Deployment

### Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel
2. Set Environment Variables in Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optionally set `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your production URL. Make sure the same URL is whitelisted in Supabase Auth.

3. Deploy. No extra build settings are required. Images are served unoptimized by Next.js per `next.config.mjs`.

### Post-deploy Checklist

- In Supabase Storage, ensure bucket `images` exists and is public (script `02-...` does this)
- In Supabase Realtime, ensure `posts`, `likes`, and `comments` are in the `supabase_realtime` publication (script `05-...`)

## Development Tools & Process

**Development Process:**

- **v0.dev** - Used for rapid UI prototyping and component generation
- **Cursor + Claude** - AI-assisted development for debugging, optimization, and code refinement
- **Manual refinement** - Custom logic, performance optimizations, and UX improvements
