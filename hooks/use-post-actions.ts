"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import toast from "react-hot-toast"

export function usePostActions() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast.error("Please sign in to like posts")
      return
    }

    setIsLoading(true)

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id)

        if (error) throw error
      } else {
        // Like
        const { error } = await supabase.from("likes").insert({
          post_id: postId,
          user_id: user.id,
        })

        if (error) throw error
      }
    } catch (error: any) {
      console.error("Error toggling like:", error)
      toast.error("Failed to update like")
    } finally {
      setIsLoading(false)
    }
  }

  const addComment = async (postId: string, content: string) => {
    if (!user) {
      toast.error("Please sign in to comment")
      return { error: "Not authenticated" }
    }

    if (!content.trim()) {
      return { error: "Comment cannot be empty" }
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      })

      if (error) throw error

      toast.success("Comment added!")
      return { error: null }
    } catch (error: any) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to delete posts")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", user.id)

      if (error) throw error

      toast.success("Post deleted!")
    } catch (error: any) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    toggleLike,
    addComment,
    deletePost,
    isLoading,
  }
}
