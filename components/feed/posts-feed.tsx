'use client'

import { useEffect, useRef, useState, useMemo, memo } from 'react'
import { usePosts } from '@/hooks/use-posts'
import { PostCard } from './post-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, RefreshCw } from 'lucide-react'
import { ImageUploadDialog } from '@/components/upload/image-upload-dialog'

interface PostsFeedProps {
  onUploadSuccess?: () => void
}

export function PostsFeed({ onUploadSuccess }: PostsFeedProps) {
  const { posts, loading, error, hasMore, isLoadingMore, fetchNextPage, refreshPosts } = usePosts()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)
  const [renderedPosts, setRenderedPosts] = useState<JSX.Element[]>([])
  const previousPostsRef = useRef<any[]>([])

  // Memoize posts individually
  useEffect(() => {
    const newRenderedPosts: JSX.Element[] = []

    posts.forEach((post, index) => {
      const prevPost = previousPostsRef.current.find((p) => p.id === post.id)
      const priority = index < 2

      // Check if the post has changed
      const hasChanged =
        !prevPost ||
        prevPost.likes_count !== post.likes_count ||
        prevPost.user_has_liked !== post.user_has_liked ||
        prevPost.comments?.length !== post.comments?.length ||
        prevPost.comments !== post.comments // also react to new array reference for comments

      if (hasChanged) {
        newRenderedPosts.push(<PostCard key={post.id} post={post} priority={priority} />)
      } else {
        // Find the old render for this post
        const oldRender = renderedPosts.find((rendered) => rendered.key === post.id)
        if (oldRender) {
          newRenderedPosts.push(oldRender)
        } else {
          newRenderedPosts.push(<PostCard key={post.id} post={post} priority={priority} />)
        }
      }
    })

    setRenderedPosts(newRenderedPosts)
    previousPostsRef.current = [...posts]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts])

  const handleUploadSuccess = () => {
    refreshPosts()
    onUploadSuccess?.()
  }

  useEffect(() => {
    if (!sentinelRef.current || hasAutoLoaded) return
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          fetchNextPage()
          setHasAutoLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [fetchNextPage, hasAutoLoaded])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <p className="font-medium">Failed to load posts</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={refreshPosts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>Welcome to PicShare!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="py-8">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No posts yet. Be the first to share your amazing photos with the world!
            </p>
            <ImageUploadDialog onUploadSuccess={handleUploadSuccess}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Camera className="h-4 w-4 mr-2" />
                Upload Your First Photo
              </Button>
            </ImageUploadDialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {renderedPosts}
      <div ref={sentinelRef} />
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button onClick={fetchNextPage} variant="outline" disabled={isLoadingMore} aria-label="Load more posts">
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}
