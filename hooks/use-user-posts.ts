"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PostWithProfile } from "@/lib/supabase/types"

export function useUserPosts(userId?: string) {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUserPosts = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          likes (
            id,
            user_id
          ),
          comments (
            id,
            content,
            created_at,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      // Transform data to include user_has_liked
      const postsWithLikeStatus = data?.map((post) => ({
        ...post,
        user_has_liked: false, // Will be updated by parent component if needed
      })) as PostWithProfile[]

      setPosts(postsWithLikeStatus || [])
    } catch (err: any) {
      console.error("Error fetching user posts:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserPosts()
  }, [userId])

  return {
    posts,
    loading,
    error,
    refetch: fetchUserPosts,
  }
}
