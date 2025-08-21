'use client'

import type React from 'react'

import { useState, memo, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePostActions } from '@/hooks/use-post-actions'
import type { PostWithProfile } from '@/lib/supabase/types'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { PostActions } from '@/components/shared/post-actions'

interface PostCardProps {
  post: PostWithProfile
  priority?: boolean
}

// Memoized image component - SHOULD NOT re-render when likes change
const PostImage = memo(
  ({ imageUrl, title, postId, priority }: { imageUrl: string; title: string; postId: string; priority: boolean }) => {
    return (
      <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        {imageUrl ? (
          <Link href={`/post/${postId}`} aria-label="Open post" className="relative block h-full w-full">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjUiIGZpbGw9IiNlMGUwZTAiLz4KPC9zdmc+"
              onError={(e) => {
                const target = e.currentTarget
                target.src = '/placeholder.jpg'
                target.srcset = ''
              }}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              unoptimized={false}
            />
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Image should NOT re-render when likes change
    return (
      prevProps.imageUrl === nextProps.imageUrl &&
      prevProps.title === nextProps.title &&
      prevProps.postId === nextProps.postId &&
      prevProps.priority === nextProps.priority
    )
  }
)

PostImage.displayName = 'PostImage'

function PostCardComponent({ post, priority = false }: PostCardProps) {
  const { user } = useAuth()
  const { deletePost } = usePostActions()
  const [currentPost, setCurrentPost] = useState(post)

  // Keep local state in sync if parent passes updated post (e.g., from feed updates)
  useEffect(() => {
    if (
      currentPost.id !== post.id ||
      currentPost.likes_count !== post.likes_count ||
      currentPost.user_has_liked !== post.user_has_liked ||
      (currentPost.comments?.length || 0) !== (post.comments?.length || 0) ||
      currentPost.comments !== post.comments
    ) {
      setCurrentPost(post)
    }
  }, [post, currentPost])

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id)
    }
  }

  const handlePostUpdate = (updatedPost: PostWithProfile) => {
    setCurrentPost(updatedPost)
  }

  const isOwner = user?.id === post.user_id

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.profiles?.full_name || post.profiles?.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{post.profiles?.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image */}
        <PostImage imageUrl={post.image_url} title={post.title} postId={post.id} priority={priority} />

        {/* Content */}
        <div>
          <h3 className="font-semibold mb-2">{post.title}</h3>
          {post.description && <p className="text-gray-600 dark:text-gray-300 text-sm">{post.description}</p>}
        </div>

        {/* Unified Post Actions */}
        <PostActions post={currentPost} showComments={false} onPostUpdate={handlePostUpdate} />
      </CardContent>
    </Card>
  )
}

// Memoize PostCard, updates only when key data changes
export const PostCard = memo(PostCardComponent, (prevProps, nextProps) => {
  const idSame = prevProps.post.id === nextProps.post.id
  const likesSame = prevProps.post.likes_count === nextProps.post.likes_count
  const userLikedSame = prevProps.post.user_has_liked === nextProps.post.user_has_liked
  const commentsSame = prevProps.post.comments?.length === nextProps.post.comments?.length
  const commentsRefSame = prevProps.post.comments === nextProps.post.comments
  const prioritySame = prevProps.priority === nextProps.priority

  return idSame && likesSame && userLikedSame && commentsSame && commentsRefSame && prioritySame
})
