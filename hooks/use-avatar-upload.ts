"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import toast from "react-hot-toast"

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const { user, updateProfile } = useAuth()
  const supabase = createClient()

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast.error("You must be logged in to upload avatar")
      return { error: "Not authenticated" }
    }

    setIsUploading(true)

    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image")
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new Error("File size must be less than 5MB")
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `avatars/${user.id}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true, // Allow overwriting existing avatar
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: profileError } = await updateProfile({
        avatar_url: publicUrl,
      })

      if (profileError) throw profileError

      toast.success("Avatar updated successfully!")
      return { data: publicUrl, error: null }
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      toast.error(error.message || "Failed to upload avatar")
      return { error: error.message }
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadAvatar,
    isUploading,
  }
}
