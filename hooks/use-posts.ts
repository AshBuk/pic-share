"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PostWithProfile } from "@/lib/supabase/types"
import { useAuth } from "./use-auth"

export function usePosts() {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchPosts = async () => {
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
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      // Transform data to include user_has_liked
      const postsWithLikeStatus = data?.map((post) => ({
        ...post,
        user_has_liked: user ? post.likes.some((like) => like.user_id === user.id) : false,
      })) as PostWithProfile[]

      setPosts(postsWithLikeStatus || [])
    } catch (err: any) {
      console.error("Error fetching posts:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshPosts = () => {
    fetchPosts()
  }

  useEffect(() => {
    fetchPosts()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("posts_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => {
        fetchPosts()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    posts,
    loading,
    error,
    refreshPosts,
  }
}
