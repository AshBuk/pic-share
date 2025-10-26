/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName?: string,
    captchaToken?: string
  ) => Promise<{ error: any }>
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
  const [initialized, setInitialized] = useState(false)

  const fetchProfile = async (userId: string) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )

      const fetchPromise = supabase.from('profiles').select('*').eq('id', userId).single()

      const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any

      if (!error && data) {
        setProfile(data)
        return
      }

      // Self-heal: if profile is missing (e.g., after schema reset), create it on the fly
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const emailLocal = (user.email || '').split('@')[0] || 'user'
      let username = emailLocal.replace(/[^A-Za-z0-9_]/g, '_')
      if (username.length < 3) username = `user_${user.id.slice(0, 6)}`

      const { data: created } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            username,
            full_name: (user.user_metadata as any)?.full_name || '',
            avatar_url: (user.user_metadata as any)?.avatar_url || '',
          },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (created) setProfile(created)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
        )

        const sessionPromise = supabase.auth.getSession()

        const {
          data: { session },
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any

        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName?: string,
    captchaToken?: string
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || '',
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          captchaToken,
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
    try {
      await supabase.auth.signOut()
    } finally {
      // Ensure local state clears even if the event is delayed
      setProfile(null)
      setUser(null)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const deleteAccount = async () => {
    if (!user) return { error: 'No user logged in' }
    const userId = user.id
    try {
      // Call server route to delete auth user via service role
      const res = await fetch('/api/delete-account', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to delete account')
      }
      // Ensure local sign-out
      await supabase.auth.signOut()
      setProfile(null)
      setUser(null)
      return { error: null }
    } catch (error) {
      console.error('Delete account error:', error)
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
