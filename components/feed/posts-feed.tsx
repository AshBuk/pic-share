"use client"

import { usePosts } from "@/hooks/use-posts"
import { PostCard } from "./post-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw } from "lucide-react"
import { ImageUploadDialog } from "@/components/upload/image-upload-dialog"

interface PostsFeedProps {
  onUploadSuccess?: () => void
}

export function PostsFeed({ onUploadSuccess }: PostsFeedProps) {
  const { posts, loading, error, refreshPosts } = usePosts()

  const handleUploadSuccess = () => {
    refreshPosts()
    onUploadSuccess?.()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
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
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
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
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>Welcome to PicShare!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="py-8">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
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
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
