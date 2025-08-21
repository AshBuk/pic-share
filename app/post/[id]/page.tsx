'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { PostWithProfile } from '@/lib/supabase/types'
import { useAuth } from '@/hooks/use-auth'
import { forceRefreshFeed } from '@/hooks/use-posts'
import { PostActions } from '@/components/shared/post-actions'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [post, setPost] = useState<PostWithProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const postId = (params?.id as string) || ''

  const handlePostUpdate = (updatedPost: PostWithProfile) => {
    setPost(updatedPost)
  }

  // Refetch post data to get latest comments and likes
  const refetchPost = async () => {
    if (!postId) return

    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          created_at
        ),
        likes (
          id,
          user_id,
          post_id,
          created_at
        ),
        comments (
          id,
          user_id,
          post_id,
          content,
          created_at,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            created_at
          )
        )
      `
      )
      .eq('id', postId)
      .single()

    if (!error && data) {
      const normalizedComments = ((data.comments || []) as any[])
        .slice()
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((c: any) => ({
          ...c,
          profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
        }))

      setPost({
        ...data,
        comments: normalizedComments,
        user_has_liked: user ? data.likes?.some((l: any) => l.user_id === user.id) : false,
      } as PostWithProfile)
    }
  }

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            created_at
          ),
          likes (
            id,
            user_id,
            post_id,
            created_at
          ),
          comments (
            id,
            user_id,
            post_id,
            content,
            created_at,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url,
              created_at
            )
          )
        `
        )
        .eq('id', postId)
        .single()

      if (!error && data) {
        const normalizedComments = ((data.comments || []) as any[])
          .slice()
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((c: any) => ({
            ...c,
            profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
          }))

        const sorted = {
          ...data,
          comments: normalizedComments,
        }
        setPost({
          ...sorted,
          user_has_liked: user ? sorted.likes?.some((l: any) => l.user_id === user.id) : false,
        } as PostWithProfile)
      }
      setLoading(false)
    }
    if (postId) fetchPost()
  }, [postId, user, supabase])

  // Removed real-time subscriptions - using unified PostActions component

  // Refresh post data when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      // inline re-fetch to keep stable deps and avoid re-creating function
      if (!postId) return
      supabase
        .from('posts')
        .select(
          `
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          created_at
        ),
        likes (
          id,
          user_id,
          post_id,
          created_at
        ),
        comments (
          id,
          user_id,
          post_id,
          content,
          created_at,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            created_at
          )
        )
      `
        )
        .eq('id', postId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            const normalizedComments = ((data.comments || []) as any[])
              .slice()
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((c: any) => ({
                ...c,
                profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
              }))
            const sorted = { ...data, comments: normalizedComments }
            setPost({
              ...sorted,
              user_has_liked: user ? sorted.likes?.some((l: any) => l.user_id === user.id) : false,
            } as PostWithProfile)
          }
        })
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [postId, user, supabase])

  // Force refresh feed when navigating away from post page
  useEffect(() => {
    return () => {
      // Cleanup: force refresh feed when leaving post page
      forceRefreshFeed()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Back to previous page">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        ) : !post ? (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
            <CardContent className="p-8 text-center">Post not found</CardContent>
          </Card>
        ) : (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
            <CardHeader>
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
                    @{post.profiles?.username} •{' '}
                    {post.created_at
                      ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                      : 'Unknown time'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-contain bg-black"
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjUiIGZpbGw9IiNlMGUwZTAiLz4KPC9zdmc+"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                {post.description && <p className="text-gray-600 dark:text-gray-300">{post.description}</p>}
              </div>

              {/* Unified Post Actions */}
              <PostActions post={post} showComments={true} maxHeightClass="max-h-96" onPostUpdate={handlePostUpdate} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
