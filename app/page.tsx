/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Plus, LogOut, Sun, Moon } from 'lucide-react'
import { ImageUploadDialog } from '@/components/upload/image-upload-dialog'
import { forceRefreshFeed } from '@/hooks/use-posts'
import { PostsFeed } from '@/components/feed/posts-feed'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const isAdmin = false
  const { theme, setTheme, systemTheme } = useTheme()
  const supabase = createClient()
  const [postsCount, setPostsCount] = useState(0)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const currentTheme = theme === 'system' ? systemTheme : theme

  const ThemeToggle = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {currentTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )

  const fetchPostsCount = useCallback(async () => {
    if (!user?.id) return
    const { count, error } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (!error && typeof count === 'number') setPostsCount(count)
  }, [supabase, user?.id])

  useEffect(() => {
    fetchPostsCount()
    channelRef.current?.unsubscribe()
    const channel = supabase
      .channel('realtime:posts-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, fetchPostsCount)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, fetchPostsCount)
      .subscribe()
    channelRef.current = channel
    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [user?.id, supabase, fetchPostsCount])

  const handleUploadSuccess = () => {
    fetchPostsCount()
    // Ensure feed shows the new post immediately
    forceRefreshFeed()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Camera className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PicShare
              </h1>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Admin link removed */}

            <Link href="/profile">
              <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile?.username || user?.email}
                </span>
              </div>
            </Link>

            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <PostsFeed onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>{profile?.full_name || 'Your Profile'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/profile">
                  <div className="flex flex-col items-center space-y-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-lg">{profile?.full_name || profile?.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{profile?.username}</p>
                    </div>
                  </div>
                </Link>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-semibold">{postsCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
                  </div>
                  <div>
                    <p className="font-semibold">0</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                  </div>
                  <div>
                    <p className="font-semibold">0</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
                  </div>
                </div>
                {/* View Profile button removed for cleaner look */}
              </CardContent>
            </Card>

            {/* Quick Upload */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>Share Something</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <ImageUploadDialog onUploadSuccess={handleUploadSuccess}>
                  <Button className="mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </ImageUploadDialog>
              </CardContent>
            </Card>

            {/* Admin panel removed */}

            {/* Suggestions */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>Suggested for you</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Start following people to see suggestions here!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
