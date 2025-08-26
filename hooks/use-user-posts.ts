/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PostWithProfile } from '@/lib/supabase/types'
import { useAuth } from './use-auth'

export function useUserPosts(userId?: string) {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<PostWithProfile[]>([])
  const [loadingLiked, setLoadingLiked] = useState(true)
  const [errorLiked, setErrorLiked] = useState<string | null>(null)
  const supabase = createClient()
  const { user } = useAuth()

  const fetchUserPosts = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(
          `
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
            user_id,
            content,
            created_at,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transform data to include user_has_liked
      const postsWithLikeStatus = data?.map((post) => ({
        ...post,
        user_has_liked: false,
      })) as PostWithProfile[]

      setPosts(postsWithLikeStatus || [])
    } catch (err: any) {
      console.error('Error fetching user posts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedPosts = async () => {
    if (!userId) {
      setLoadingLiked(false)
      return
    }

    try {
      setLoadingLiked(true)
      setErrorLiked(null)

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          likes!inner (
            id,
            user_id
          ),
          comments (
            id,
            user_id,
            content,
            created_at,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          )
        `
        )
        .eq('likes.user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const normalized = (data || []).map((post: any) => ({
        ...post,
        comments: (post.comments || [])
          .slice()
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        likes_count: Array.isArray(post.likes) ? post.likes.length : post.likes_count,
        user_has_liked: user ? (post.likes || []).some((l: any) => l.user_id === user.id) : false,
      })) as PostWithProfile[]

      setLikedPosts(normalized)
    } catch (err: any) {
      console.error('Error fetching liked posts:', err)
      setErrorLiked(err.message)
    } finally {
      setLoadingLiked(false)
    }
  }

  useEffect(() => {
    fetchUserPosts()
    fetchLikedPosts()
  }, [userId])

  return {
    posts,
    loading,
    error,
    refetch: fetchUserPosts,
    likedPosts,
    loadingLiked,
    errorLiked,
    refetchLiked: fetchLikedPosts,
  }
}
