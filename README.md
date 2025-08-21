<div align="center">

# 📸 PicShare

> \*\*A Demo Project – Instagram-like photo sharing application built in 24 hours as part of a coding challenge

</div>

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://pics-share.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-black?style=for-the-badge)](https://ui.shadcn.com/)

## About This Project

This project was built as part of a coding challenge to demonstrate full-stack development skills. The task was to create a **modern Instagram-like photo sharing application** with full functionality in a limited timeframe.

## Live Demo

**🔗 [View Live Application](https://pics-share.vercel.app)**

### Development Story

**Timeline:** Built in ~24 hours  
**Challenge:** Create a feature-complete demo social media app from scratch.

**Development Process:**

- **v0.dev** - Used for rapid UI prototyping and component generation
- **Cursor + Claude** - AI-assisted development for debugging, optimization, and code refinement
- **Manual refinement** - Custom logic, performance optimizations, and UX improvements

### ✨ Key Features

- 🔐 **Authentication** - Email/password signup and login
- 📸 **Photo Upload** - Drag & drop with file validation (5MB limit)
- 🖼️ **Image Gallery** - Responsive grid layout with infinite scroll
- ❤️ **Social Features** - Like and comment on posts in real-time
- 🌙 **Dark/Light Mode** - System preference support with manual toggle
- 📱 **Responsive Design** - Mobile-first approach, works on all devices
- ⚡ **Real-time Updates** - Live likes, comments, and new posts
- 🎨 **Modern UI** - Glassmorphism effects, smooth animations

### Tech Stack

**Frontend:**

- **Next.js 15** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui** components
- **React Hook Form** + **Zod** validation
- **Lucide React** icons

**Backend:**

- **Supabase** - Database, Auth, Storage, Real-time subscriptions
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Storage** for image hosting

**Performance & UX:**

- Image optimization with `next/image`
- Component memoization for performance
- Loading states and skeleton components
- Error boundaries and proper error handling

## Architecture Highlights

- **Clean separation of concerns** - hooks/, components/, lib/ structure
- **Custom React hooks** - Reusable business logic
- **TypeScript interfaces** - Full type safety throughout
- **Performance optimized** - Memoized components, lazy loading
- **Real-time architecture** - Supabase subscriptions for live updates

## Local development

1. Prerequisites

- Node.js 18.18+ and npm 9+
- A Supabase project (URL + anon key)

2. Environment variables

Create a `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# Optional: used for auth email confirmation redirect in dev
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

Also add both `http://localhost:3000` and your production domain to Supabase Auth → URL Configuration (redirects and allowed origins).

3. Database setup (run in Supabase SQL editor)

Run these scripts in order:

- `scripts/01-create-tables.sql`
- `scripts/02-create-storage-bucket.sql`
- `scripts/03-create-functions.sql`
- `scripts/05-enable-realtime.sql`

4. Start the app

```
npm install
npm run dev
```

The app will be available on `http://localhost:3000`.

### Seed demo content (optional)

Populate real demo users, posts with real images, likes and comments:

1. Ensure env variables:
   - `SUPABASE_URL` (or reuse `NEXT_PUBLIC_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run:

```
node scripts/06-seed-demo.mjs
```

This will create users like David Cohen, Rivka Levi, etc., upload images to the `images` bucket, and generate likes/comments. All data uses real Supabase tables so you can like and comment interactively.

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel
2. Set Environment Variables in Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optionally set `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your production URL. Make sure the same URL is whitelisted in Supabase Auth.

3. Deploy. No extra build settings are required. Images are served unoptimized by Next.js per `next.config.mjs`.

## Post-deploy checklist

- In Supabase Storage, ensure bucket `images` exists and is public (script `02-...` does this)
- In Supabase Realtime, ensure `posts`, `likes`, and `comments` are in the `supabase_realtime` publication (script `05-...`)

## 📜 License

MIT License - feel free to use this project as a learning resource or starting point for your own applications.

## ⭐ Support

If this project helped you learn something new, please consider:

- ⭐ **Starring this repository**
- 💖 **Sponsoring** my open source works: [GitHub Sponsors](https://github.com/sponsors/AshBuk)
