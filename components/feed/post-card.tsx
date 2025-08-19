"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Send } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePostActions } from "@/hooks/use-post-actions"
import type { PostWithProfile } from "@/lib/supabase/types"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: PostWithProfile
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const { user } = useAuth()
  const { toggleLike, addComment, deletePost, isLoading } = usePostActions()

  const handleLike = () => {
    toggleLike(post.id, post.user_has_liked)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const { error } = await addComment(post.id, commentText)
    if (!error) {
      setCommentText("")
    }
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost(post.id)
    }
  }

  const isOwner = user?.id === post.user_id

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {post.profiles?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.profiles?.full_name || post.profiles?.username}</p>
              <p className="text-sm text-gray-500">
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
        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={post.image_url || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold mb-2">{post.title}</h3>
          {post.description && <p className="text-gray-600 text-sm">{post.description}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={post.user_has_liked ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.user_has_liked ? "fill-current" : ""}`} />
              {post.likes_count}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments?.length || 0}
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            {/* Existing Comments */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.profiles?.avatar_url || ""} />
                      <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {comment.profiles?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium">{comment.profiles?.username}</p>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            {user && (
              <form onSubmit={handleComment} className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                    {user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="bg-white/50"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentText.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
