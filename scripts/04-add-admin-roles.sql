-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Create admin policies
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create admin stats view
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM likes) as total_likes,
  (SELECT COUNT(*) FROM comments) as total_comments,
  (SELECT COUNT(*) FROM posts WHERE created_at >= CURRENT_DATE) as posts_today,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE) as users_today;

-- Grant access to admin stats
GRANT SELECT ON admin_stats TO authenticated;

-- Create policy for admin stats
CREATE POLICY "Admins can view stats" ON admin_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );
