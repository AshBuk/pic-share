"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import toast from "react-hot-toast"

interface UploadImageParams {
  file: File
  title: string
  description?: string
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const uploadImage = async ({ file, title, description }: UploadImageParams) => {
    if (!user) {
      toast.error("You must be logged in to upload images")
      return { error: "Not authenticated" }
    }

    setIsUploading(true)

    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image")
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("File size must be less than 10MB")
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName)

      // Create post record
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          image_url: publicUrl,
        })
        .select()
        .single()

      if (postError) throw postError

      toast.success("Image uploaded successfully!")
      return { data: postData, error: null }
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.message || "Failed to upload image")
      return { error: error.message }
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadImage,
    isUploading,
  }
}
