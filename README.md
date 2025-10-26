<div align="center">

<img width="550" height="635" alt="pics-share" src="https://github.com/user-attachments/assets/3841d59a-4b92-4db0-a536-2fd3409d48dd" />

> A Demo Project – Instagram-like photo sharing application built in 24 hours as part of a coding challenge

</div>

<div align="center">

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://pics-share.vercel.app)
[![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-black?style=for-the-badge)](https://ui.shadcn.com/)

</div>

## About

**📸 PicShare project was built as part of a coding challenge to demonstrate full-stack development skills. The task was to create a **modern Instagram-like photo sharing application** with full functionality in a limited timeframe.**

## Live Demo

**🔗 [View Live Application](https://pics-share.vercel.app)**

*Demo version on Vercel with authentication disabled — guest mode only.*

### Development Story

**Timeline:** Built in ~24 hours  
**Challenge:** Create a feature-complete demo social media app from scratch.
**Afterwards**, I made several commits (linter/formatter, cascading data deletion on profile removal, real-time updates) to harden the app.

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

## For Developers

For development setup, deployment instructions, and technical details, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## 📜 License

MIT License.

## ⭐ Support

If this project helped you learn something new, please consider:

- ⭐ **Starring this repository**
- 💖 **Sponsoring** my open source works:

[![Sponsor](https://img.shields.io/badge/Sponsor-💖-pink?style=for-the-badge&logo=github)](https://github.com/sponsors/AshBuk) [![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=R3HZH8DX7SCJG)
