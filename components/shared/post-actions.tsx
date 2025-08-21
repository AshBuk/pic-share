'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePostActions } from '@/hooks/use-post-actions'
import { CommentsSection } from '@/components/feed/comments-section'
import type { PostWithProfile } from '@/lib/supabase/types'

interface PostActionsProps {
  post: PostWithProfile
  showComments?: boolean
  maxHeightClass?: string
  onPostUpdate?: (updatedPost: PostWithProfile) => void
}

export function PostActions({
  post,
  showComments = false,
  maxHeightClass = 'max-h-60',
  onPostUpdate,
}: PostActionsProps) {
  const { user } = useAuth()
  const { toggleLike, isLoading } = usePostActions()
  const [showCommentsState, setShowCommentsState] = useState(showComments)
  const [optimisticPost, setOptimisticPost] = useState(post)

  // Update optimistic post when external post changes
  useEffect(() => {
    setOptimisticPost(post)
  }, [post])

  const handleLike = async () => {
    if (!user) return

    // Optimistic update
    const prevLikedState = optimisticPost.user_has_liked
    const newLikedState = !prevLikedState
    const newLikesCount = newLikedState
      ? (optimisticPost.likes_count || 0) + 1
      : Math.max((optimisticPost.likes_count || 0) - 1, 0)

    const optimisticUpdate = {
      ...post, // Use original post to preserve all fields
      ...optimisticPost, // Apply current optimistic changes
      user_has_liked: newLikedState,
      likes_count: newLikesCount,
    }

    setOptimisticPost(optimisticUpdate)
    onPostUpdate?.(optimisticUpdate)

    const result = await toggleLike(post.id, prevLikedState)

    // If error, rollback
    if (result?.error) {
      setOptimisticPost(post)
      onPostUpdate?.(post)
    }
  }

  // Comments updates happen via global refresh functions, no callback needed

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLoading}
            className={optimisticPost.user_has_liked ? 'text-red-500' : ''}
            aria-label={optimisticPost.user_has_liked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={`h-4 w-4 mr-1 ${optimisticPost.user_has_liked ? 'fill-current' : ''}`} />
            {optimisticPost.likes_count || 0}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommentsState(!showCommentsState)}
            aria-label="Toggle comments"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {optimisticPost.comments?.length || 0}
          </Button>
        </div>

        <Button variant="ghost" size="sm" aria-label="Share post">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments section */}
      {showCommentsState && (
        <CommentsSection
          postId={optimisticPost.id}
          comments={optimisticPost.comments as any}
          maxHeightClass={maxHeightClass}
        />
      )}
    </div>
  )
}
