"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  deleteAccount: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const supabase = createClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (!error) {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        
        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
          setLoading(false)
        }
      } catch (error) {
        
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || "",
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "No user logged in" }

    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const deleteAccount = async () => {
    if (!user) return { error: "No user logged in" }
    const userId = user.id
    try {
      // Get user's images for cleanup
      const { data: posts } = await supabase
        .from("posts")
        .select("image_url")
        .eq("user_id", userId)

      // Delete profile first - CASCADE will handle all related data
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId)
      
      if (profileError) throw profileError

      // Clean up images from storage (best effort - don't fail if errors)
      if (posts && posts.length > 0) {
        const imagePaths = posts.map(post => {
          const fileName = post.image_url.split('/').pop()
          return `${userId}/${fileName}`
        }).filter(Boolean)
        
        if (imagePaths.length > 0) {
          await supabase.storage.from("images").remove(imagePaths)
        }
      }

      // Sign out locally  
      await supabase.auth.signOut()
      setProfile(null)
      setUser(null)
      return { error: null }
    } catch (error) {
      console.error("Delete account error:", error)
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    deleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
