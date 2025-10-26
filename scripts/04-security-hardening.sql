/*
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

-- Security hardening: storage RLS, rate limits, constraints, indexes, optional denylist

-- 1) Storage: restrict INSERT path to `${auth.uid()}/...`, keep public SELECT
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
CREATE POLICY "Users can upload images" 
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2) Rate limiting helpers
CREATE OR REPLACE FUNCTION public.can_create_post(uid uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FILTER (WHERE created_at > now() - interval '1 day') < 3
    FROM posts WHERE user_id = uid
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_comment(uid uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT
      (COUNT(*) FILTER (WHERE created_at > now() - interval '1 minute') < 3)
      AND
      (COUNT(*) FILTER (WHERE created_at > now() - interval '1 day') < 10)
    FROM comments WHERE user_id = uid
  );
END;
$$;

-- Strengthen INSERT policies for posts/comments
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Users can insert their own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.can_create_post(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
CREATE POLICY "Users can insert their own comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.can_create_comment(auth.uid()));

-- 3) CHECK constraints (idempotent)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_title_len;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_desc_len;
ALTER TABLE posts
  ADD CONSTRAINT posts_title_len CHECK (char_length(title) > 0 AND char_length(title) <= 100),
  ADD CONSTRAINT posts_desc_len CHECK (description IS NULL OR char_length(description) <= 500);

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_len;
ALTER TABLE comments
  ADD CONSTRAINT comments_len CHECK (char_length(content) > 0 AND char_length(content) <= 500);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_valid;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_username_valid CHECK (username ~ '^[A-Za-z0-9_]{3,}$');

-- 4) (Optional) Block disposable email domains and harden handle_new_user
CREATE TABLE IF NOT EXISTS public.blocked_email_domains (domain text PRIMARY KEY);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE dom text;
BEGIN
  IF NEW.email IS NOT NULL THEN
    dom := lower(split_part(NEW.email, '@', 2));
    IF EXISTS (SELECT 1 FROM public.blocked_email_domains d WHERE d.domain = dom) THEN
      RAISE EXCEPTION 'Email domain not allowed';
    END IF;
  END IF;

  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5) Indexes to support rate limit checks
CREATE INDEX IF NOT EXISTS idx_posts_user_created_at ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_created_at ON comments(user_id, created_at DESC);

-- 6) Grants: allow public read-only feed; writes guarded by RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON TABLE profiles, posts, likes, comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles, posts, likes, comments TO authenticated;

-- Default privileges for future tables created by postgres
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;


