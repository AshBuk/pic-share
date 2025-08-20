# PicShare - Complete Photo Sharing Platform Specification

Create a modern photo sharing app called "PicShare" (mini Instagram clone) using Next.js 15 with App Router, TypeScript, Tailwind CSS, and Supabase integration.

## Project Architecture & Tech Stack

**Core Technologies:**

- Next.js 15 with App Router (app directory)
- TypeScript strict mode
- Tailwind CSS for styling
- shadcn/ui components
- Supabase client v2 for database and auth
- React Query for data fetching
- React Hook Form + Zod for forms
- Lucide React for icons

**Code Generation Rules:**

- Always include proper TypeScript types and interfaces
- Error handling with try/catch blocks
- Loading states and skeleton components
- Responsive design (mobile-first approach)
- Accessibility attributes (aria-labels, etc.)
- Modern glassmorphism/neumorphism design
- Use Server Components by default, add 'use client' only when needed
- Dark/light mode support with CSS variables

## Pages & Routing Structure

**App Router Pages:**

- `/` - Home feed with photo grid
- `/auth/signin` - User sign in page
- `/auth/signup` - User registration page
- `/profile` - User profile with personal posts grid
- `/upload` - Image upload form with preview
- `/post/[id]` - Single post view with comments

## Layout & Navigation

**Header Navigation:**

- Left: "PicShare" logo with camera icon (Lucide React)
- Center: Navigation links
  - "Home" (always visible)
  - "Upload" (authenticated users only)
- Right: User menu
  - Authenticated: Profile avatar, Profile link, Sign Out
  - Non-authenticated: Sign In button
- Theme toggle (light/dark mode)
- Mobile: Hamburger menu for small screens

**Responsive Design:**

- Desktop: 3-column photo grid
- Mobile: 1-column photo grid
- Use next/image for all images with responsive sizes
- Card-based layout with hover effects

## Core Functionality Requirements

### 1. User Authentication (Supabase Auth)

- Registration with email/password
- Login with email/password
- Automatic profile creation on signup
- Protected routes for /upload and /profile
- Session management with AuthProvider context

### 2. Image Upload System

- File upload with drag & drop support
- Image preview before upload
- File type validation (jpg, png, webp, gif)
- File size validation (max 5MB)
- Title and description input
- Upload to Supabase Storage bucket "images" (public)
- Organized storage: `/user_id/filename.ext`

### 3. Photo Gallery & Feed

- Main feed displaying all posts in chronological order
- Photo grid layout with responsive columns
- Infinite scroll or pagination
- Display: image, title, description, author name, date
- Filter posts by specific user
- Real-time updates when new posts are added

### 4. User Interactions

- Like/unlike posts with heart icon
- Real-time like count updates
- Add/delete comments on posts
- Delete posts (original uploader only)
- User profile pages showing personal posts

## Database Integration (Supabase)

**Environment Variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://vbmjwyzimcezocxxbqxm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibWp3eXppbWNlem9jeHhicXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTI3NjgsImV4cCI6MjA3MTE4ODc2OH0.LjmXtJU6gN033_uTzSlXinZMNN7VbnOUu0MDtd5ADcQ
```

**Database Schema (Already Created):**

```typescript
// TypeScript Interfaces
interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

interface Post {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string
  created_at: string
  likes_count: number
  profiles?: Profile // Join relation
}

interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  profiles?: Profile // Join relation
}
```

**Storage Configuration:**

- Bucket name: "images"
- Public bucket for image access
- File organization: `/user_id/filename.ext`

## Required Components & Structure

### Core Components:

```
components/
├── ui/              # shadcn/ui components
├── auth/
│   ├── AuthProvider.tsx     # Context for authentication
│   ├── SignInForm.tsx       # Login form with validation
│   ├── SignUpForm.tsx       # Registration form
│   └── ProtectedRoute.tsx   # Route protection wrapper
├── posts/
│   ├── PostCard.tsx         # Individual post display
│   ├── PostGrid.tsx         # Grid layout for posts
│   ├── PostUpload.tsx       # Upload form with preview
│   ├── PostComments.tsx     # Comments section
│   └── LikeButton.tsx       # Like/unlike functionality
├── layout/
│   ├── Header.tsx           # Main navigation
│   ├── MobileMenu.tsx       # Mobile hamburger menu
│   └── ThemeToggle.tsx      # Dark/light mode toggle
└── common/
    ├── LoadingSkeleton.tsx  # Loading placeholders
    └── ErrorBoundary.tsx    # Error handling
```

### Required Hooks:

```typescript
// Custom hooks for data fetching
const useAuth = () => {
  /* Supabase auth state */
}
const usePosts = () => {
  /* Fetch all posts with React Query */
}
const useUserPosts = (userId: string) => {
  /* User-specific posts */
}
const usePost = (postId: string) => {
  /* Single post with comments */
}
const useUploadImage = () => {
  /* Image upload to storage */
}
const useLikePost = () => {
  /* Like/unlike mutation */
}
const useComments = (postId: string) => {
  /* Post comments */
}
```

## Implementation Details

### Supabase Client Setup:

```typescript
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Form Validation:

- Use React Hook Form with Zod schemas
- Validate file types and sizes
- Show inline error messages
- Loading states during submissions

### Performance Optimizations:

- Use next/image with proper sizing
- Implement image lazy loading
- Add blur placeholders for images
- Optimize Supabase queries with proper indexes
- Use React Query for caching and real-time updates

### Real-time Features:

- Subscribe to new posts in feed
- Real-time like count updates
- Live comment updates on posts (insert/update/delete)
- User presence indicators

## Design System & UI

**Visual Style:**

- Instagram-inspired clean aesthetic
- Card-based layouts with subtle shadows
- Glassmorphism effects for modern feel
- Consistent spacing using Tailwind scale
- Smooth animations and transitions

**Color Scheme:**

- Support both light and dark themes
- Use CSS custom properties for theme switching
- Accessible color contrast ratios
- Brand colors for primary actions

**Loading States:**

- Skeleton components for feed loading
- Spinner for form submissions
- Progressive image loading with blur
- Optimistic UI updates for likes/comments

## Error Handling & Validation

**Frontend Validation:**

- Form validation with Zod schemas
- File type/size validation before upload
- Real-time validation feedback
- Accessible error messages

**Error Boundaries:**

- Wrap all routes in error boundaries
- Graceful error fallbacks
- Error reporting for debugging
- Retry mechanisms for failed operations

**Network Error Handling:**

- Handle Supabase connection errors
- Offline state detection
- Retry logic for failed requests
- User-friendly error messages

## Security & Best Practices

**Authentication Security:**

- Row Level Security (RLS) enabled on all tables
- Protected routes with proper redirects
- Secure file upload validation
- User session management

**Data Protection:**

- Input sanitization for user content
- Proper CORS configuration
- Environment variable security
- Image upload size limits

## Deployment Requirements

**Production Checklist:**

- All environment variables configured
- Supabase RLS policies active
- Image optimization enabled
- Error tracking implemented
- Performance monitoring

Generate a complete, production-ready photo sharing application that follows all these specifications and creates an Instagram-like user experience with modern web development best practices.
