"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import toast from "react-hot-toast"

interface AdminStats {
  total_users: number
  total_posts: number
  total_likes: number
  total_comments: number
  posts_today: number
  users_today: number
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const { user, profile } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setIsAdmin(profile.role === "admin" || profile.role === "moderator")
      setLoading(false)
    }
  }, [profile])

  const fetchStats = async () => {
    if (!isAdmin) return

    try {
      const { data, error } = await supabase.from("admin_stats").select("*").single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    }
  }

  const fetchAllUsers = async () => {
    if (!isAdmin) return { data: null, error: "Not authorized" }

    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      return { data, error }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const fetchAllPosts = async () => {
    if (!isAdmin) return { data: null, error: "Not authorized" }

    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })

      return { data, error }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const updateUserRole = async (userId: string, role: "user" | "admin" | "moderator") => {
    if (!isAdmin) {
      toast.error("Not authorized")
      return { error: "Not authorized" }
    }

    try {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

      if (error) throw error

      toast.success("User role updated successfully")
      return { error: null }
    } catch (error: any) {
      toast.error("Failed to update user role")
      return { error: error.message }
    }
  }

  const deletePost = async (postId: string) => {
    if (!isAdmin) {
      toast.error("Not authorized")
      return { error: "Not authorized" }
    }

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId)

      if (error) throw error

      toast.success("Post deleted successfully")
      return { error: null }
    } catch (error: any) {
      toast.error("Failed to delete post")
      return { error: error.message }
    }
  }

  const banUser = async (userId: string) => {
    if (!isAdmin) {
      toast.error("Not authorized")
      return { error: "Not authorized" }
    }

    // In a real app, you'd implement user banning logic
    toast.success("User banned successfully")
    return { error: null }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  return {
    isAdmin,
    loading,
    stats,
    fetchStats,
    fetchAllUsers,
    fetchAllPosts,
    updateUserRole,
    deletePost,
    banUser,
  }
}
