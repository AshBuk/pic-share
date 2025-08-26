/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Settings, Grid3X3, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUserPosts } from '@/hooks/use-user-posts'
import { EditProfileDialog } from './edit-profile-dialog'
import { PostCard } from '@/components/feed/post-card'
import { formatDistanceToNow } from 'date-fns'

interface UserProfileProps {
  userId?: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const { user, profile } = useAuth()
  const { posts, loading, error, likedPosts, loadingLiked, errorLiked } = useUserPosts(userId || user?.id)
  const isOwnProfile = !userId || userId === user?.id

  const currentProfile = profile // In a full app, you'd fetch the specific user's profile

  if (!currentProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Profile Header */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <Avatar className="h-32 w-32">
              <AvatarImage src={currentProfile.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-4xl">
                {currentProfile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{currentProfile.full_name || currentProfile.username}</h1>
                <p className="text-gray-600 dark:text-gray-300">@{currentProfile.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Joined {formatDistanceToNow(new Date(currentProfile.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-8">
                <div className="text-center">
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center md:justify-start space-x-4">
                {isOwnProfile ? (
                  <EditProfileDialog>
                    <Button variant="outline" className="bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </EditProfileDialog>
                ) : (
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Follow
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts" className="flex items-center space-x-2">
            <Grid3X3 className="h-4 w-4" />
            <span>Posts</span>
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Liked</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">Failed to load posts: {error}</p>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <Camera className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No posts yet</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isOwnProfile
                      ? 'Share your first photo to get started!'
                      : "This user hasn't shared any photos yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          {loadingLiked ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : errorLiked ? (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400">Failed to load liked posts: {errorLiked}</p>
              </CardContent>
            </Card>
          ) : likedPosts.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No liked posts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {likedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
