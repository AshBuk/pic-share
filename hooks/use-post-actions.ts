'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import { refreshFeedLikes, refreshFeedComments, forceRefreshFeed } from './use-posts'
import toast from 'react-hot-toast'

export function usePostActions() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast.error('Please sign in to like posts')
      return { error: 'Not authenticated' }
    }

    setIsLoading(true)

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)

        if (error) throw error
        // Update feed immediately after successful like removal
        setTimeout(() => refreshFeedLikes(), 50)
        return { error: null }
      } else {
        // Like
        const { error } = await supabase.from('likes').insert({
          post_id: postId,
          user_id: user.id,
        })

        if (error) throw error
        // Update feed immediately after successful like addition
        setTimeout(() => refreshFeedLikes(), 50)
        return { error: null }
      }
    } catch (error: any) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const addComment = async (postId: string, content: string) => {
    if (!user) {
      toast.error('Please sign in to comment')
      return { error: 'Not authenticated' }
    }

    if (!content.trim()) {
      return { error: 'Comment cannot be empty' }
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      })

      if (error) throw error

      // Update feed comments after successful comment addition
      setTimeout(() => refreshFeedComments(), 50)
      // Also trigger a broader refresh for open post sync
      setTimeout(() => window.dispatchEvent(new Event('focus')), 100)
      toast.success('Comment added!')
      return { error: null }
    } catch (error: any) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const updateComment = async (commentId: string, content: string) => {
    if (!user) {
      toast.error('Please sign in to edit comments')
      return { error: 'Not authenticated' }
    }

    if (!content.trim()) {
      return { error: 'Comment cannot be empty' }
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update feed comments after successful comment update
      setTimeout(() => refreshFeedComments(), 50)
      // Also trigger a broader refresh for open post sync
      setTimeout(() => window.dispatchEvent(new Event('focus')), 100)
      toast.success('Comment updated!')
      return { error: null }
    } catch (error: any) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to delete comments')
      return { error: 'Not authenticated' }
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id)

      if (error) throw error

      // Update feed comments after successful comment deletion
      setTimeout(() => refreshFeedComments(), 50)
      // Also trigger a broader refresh for open post sync
      setTimeout(() => window.dispatchEvent(new Event('focus')), 100)
      toast.success('Comment deleted!')
      return { error: null }
    } catch (error: any) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to delete posts')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)

      if (error) throw error

      toast.success('Post deleted!')
      // Immediately refresh feed (in addition to realtime)
      setTimeout(() => forceRefreshFeed(), 50)
    } catch (error: any) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    deletePost,
    isLoading,
  }
}
