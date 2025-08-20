## Database Structure (Supabase)

### profiles table

- `id` (uuid, FK to auth.users)
- `username` (text, unique)
- `full_name` (text)
- `avatar_url` (text)
- `created_at` (timestamp)

### posts table

- `id` (uuid, primary key)
- `user_id` (uuid, FK to profiles)
- `title` (text)
- `description` (text)
- `image_url` (text)
- `created_at` (timestamp)
- `likes_count` (integer, default 0)

### likes table

- `id` (uuid, primary key)
- `user_id` (uuid, FK to profiles)
- `post_id` (uuid, FK to posts)
- `created_at` (timestamp)

### comments table

- `id` (uuid, primary key)
- `user_id` (uuid, FK to profiles)
- `post_id` (uuid, FK to posts)
- `content` (text)
- `created_at` (timestamp)

### storage (Supabase Storage)

- Bucket: `images` (public)
- Path convention: `/user_id/filename.ext`
