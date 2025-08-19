"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Eye } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface PostWithProfile {
  id: string
  title: string
  description: string | null
  image_url: string
  created_at: string
  likes_count: number
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export function PostsManagement() {
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { fetchAllPosts, deletePost } = useAdmin()

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await fetchAllPosts()
    if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const { error } = await deletePost(postId)
      if (!error) {
        fetchPosts() // Refresh the list
      }
    }
  }

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Posts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="h-16 w-16 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Posts Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium truncate max-w-xs">{post.title}</h3>
                  {post.description && <p className="text-sm text-gray-600 truncate max-w-xs">{post.description}</p>}
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={post.profiles?.avatar_url || ""} />
                        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {post.profiles?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-500">@{post.profiles?.username}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-gray-400">{post.likes_count} likes</span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
