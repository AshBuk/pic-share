/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PostWithProfile } from '@/lib/supabase/types'
import { useAuth } from './use-auth'

// Global cache to persist posts across component remounts
let postsCache: PostWithProfile[] = []
let lastFetchTime = 0
const CACHE_DURATION = 30000 // 30 seconds

// Global functions for updating feed from other components
let globalApplyLikesUpdate: (() => void) | null = null
let globalApplyCommentsUpdate: (() => void) | null = null
let globalForceRefresh: (() => void) | null = null

export function refreshFeedLikes() {
  if (globalApplyLikesUpdate) {
    globalApplyLikesUpdate()
  }
}

export function refreshFeedComments() {
  if (globalApplyCommentsUpdate) {
    globalApplyCommentsUpdate()
  }
}

export function forceRefreshFeed() {
  if (globalForceRefresh) {
    globalForceRefresh()
  }
}

export function usePosts() {
  const [posts, setPosts] = useState<PostWithProfile[]>(postsCache)
  const [loading, setLoading] = useState(postsCache.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 3
  const { user } = useAuth()
  const supabase = createClient()
  const fetchedRef = useRef(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchPage = async (targetPage: number, force = false) => {
    const now = Date.now()

    if (!force && postsCache.length > 0 && targetPage === 0 && now - lastFetchTime < CACHE_DURATION) {
      setPosts(postsCache)
      setLoading(false)
      setHasMore(postsCache.length >= PAGE_SIZE)
      return
    }

    const from = targetPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const {
      data,
      error: fetchError,
      count,
    } = await supabase
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
      `,
        { count: 'estimated' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchError) throw fetchError

    const pagePosts = (data || []).map((post: any) => ({
      ...post,
      comments: (post.comments || [])
        .slice()
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      // Derive likes_count from likes array to avoid relying on DB trigger
      likes_count: Array.isArray(post.likes) ? post.likes.length : post.likes_count,
      user_has_liked: user ? post.likes?.some((like: any) => like.user_id === user.id) : false,
    })) as PostWithProfile[]

    const newPosts = targetPage === 0 ? pagePosts : [...posts, ...pagePosts]
    postsCache = newPosts
    lastFetchTime = now
    setPosts(newPosts)
    setPage(targetPage)
    setHasMore(pagePosts.length === PAGE_SIZE)
  }

  const reloadFromStart = async () => {
    setLoading(true)
    setPage(0)
    setHasMore(true)
    postsCache = []
    try {
      await fetchPage(0, true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update only likes without touching images/comments
  const applyLikesUpdate = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select(`id, likes ( id, user_id ), likes_count`)
        .order('created_at', { ascending: false })

      if (!data) {
        return
      }
      const byId: Record<string, any> = Object.fromEntries(data.map((p: any) => [p.id, p]))
      setPosts((prev) => {
        let hasChanges = false
        const updatedPosts = prev.map((p) => {
          const mini = byId[p.id]
          if (!mini) return p // If no data for this post, return the original object

          const likes = mini.likes || []
          // Always compute from likes array for consistency
          const newLikesCount = likes.length
          const newUserHasLiked = user ? likes.some((l: any) => l.user_id === user.id) : false

          // IMPORTANT: return the original object if nothing changed
          if (p.likes_count === newLikesCount && p.user_has_liked === newUserHasLiked) {
            return p // Return the SAME object - memoization will work!
          }
          hasChanges = true

          // Create a new object only if something changed
          return {
            ...p,
            likes: likes,
            likes_count: newLikesCount,
            user_has_liked: newUserHasLiked,
          } as PostWithProfile
        })

        // If nothing changed, return the same array
        if (!hasChanges) {
          return prev
        }

        postsCache = updatedPosts
        return updatedPosts
      })
    } catch {}
  }, [user])

  // Lightweight in-place updates for comments without refetching images
  const applyCommentsUpdate = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select(
          `
                  id,
                  comments ( id, user_id, content, created_at, profiles:user_id ( id, username, avatar_url ) )
                `
        )
        .order('created_at', { ascending: false })

      if (!data) {
        return
      }
      const byId: Record<string, any> = Object.fromEntries(data.map((p: any) => [p.id, p]))
      setPosts((prev) => {
        const updatedPosts = prev.map((p) => {
          const mini = byId[p.id]
          if (!mini) return p
          return {
            ...p,
            comments: (mini.comments || [])
              .slice()
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
          } as PostWithProfile
        })
        postsCache = updatedPosts
        return updatedPosts
      })
    } catch {}
  }, [user])

  const fetchInitial = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchPage(0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchNextPage = async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    setError(null)
    try {
      await fetchPage(page + 1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Initial fetch should run for both guests and authenticated users
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchInitial()
    }
  }, [])

  // Update data when returning to tab/page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Force refresh everything when returning to feed
        setTimeout(() => {
          applyLikesUpdate()
          applyCommentsUpdate()
        }, 100)
      }
    }

    const handleFocus = () => {
      setTimeout(() => {
        applyLikesUpdate()
        applyCommentsUpdate()
      }, 100)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [applyLikesUpdate])

  // Bind global functions to local ones
  useEffect(() => {
    globalApplyLikesUpdate = applyLikesUpdate
    globalApplyCommentsUpdate = applyCommentsUpdate
    globalForceRefresh = reloadFromStart
    return () => {
      globalApplyLikesUpdate = null
      globalApplyCommentsUpdate = null
      globalForceRefresh = null
    }
  }, [applyLikesUpdate, applyCommentsUpdate])

  // Re-enable real-time subscriptions to keep feed in sync across clients
  useEffect(() => {
    try {
      channelRef.current?.unsubscribe()
    } catch {}

    const channel = supabase
      .channel('realtime:feed')
      // Comments changes
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => applyCommentsUpdate())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comments' }, () => applyCommentsUpdate())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, () => applyCommentsUpdate())
      // Likes changes
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, () => applyLikesUpdate())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'likes' }, () => applyLikesUpdate())
      // Posts changes
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => reloadFromStart())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, () => reloadFromStart())
      .subscribe()

    channelRef.current = channel
    return () => {
      try {
        channelRef.current?.unsubscribe()
      } catch {}
    }
  }, [applyCommentsUpdate, applyLikesUpdate, user, reloadFromStart])

  // Quick sync on mount/return to feed (SPA navigation may not trigger focus/visibility)
  useEffect(() => {
    setTimeout(() => {
      applyLikesUpdate()
      applyCommentsUpdate()
    }, 0)
  }, [applyLikesUpdate, applyCommentsUpdate])

  // Sync on browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      setTimeout(() => {
        applyLikesUpdate()
        applyCommentsUpdate()
      }, 50)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [applyLikesUpdate, applyCommentsUpdate])

  return {
    posts,
    loading,
    error,
    hasMore,
    isLoadingMore,
    fetchNextPage,
    refreshPosts: reloadFromStart,
    forceRefresh: reloadFromStart,
  }
}
