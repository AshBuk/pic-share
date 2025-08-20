'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useAvatarUpload } from '@/hooks/use-avatar-upload'

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  full_name: z.string().max(100, 'Full name must be less than 100 characters').optional(),
  // Bio removed
})

type ProfileForm = z.infer<typeof profileSchema>

interface EditProfileDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function EditProfileDialog({ children, onSuccess }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, profile, updateProfile, deleteAccount } = useAuth()
  const { uploadAvatar, isUploading } = useAvatarUpload()

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
    },
  })

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadAvatar(file)
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)

    const { error } = await updateProfile({
      username: data.username,
      full_name: data.full_name || null,
    })

    if (error) {
      form.setError('root', { message: error.message || 'Failed to update profile' })
    } else {
      setOpen(false)
      onSuccess?.()
    }

    setIsLoading(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading && !isUploading) {
      setOpen(newOpen)
      if (newOpen) {
        // Reset form with current profile data
        form.reset({
          username: profile?.username || '',
          full_name: profile?.full_name || '',
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information and avatar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                  {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-600 text-center">Click the camera icon to change your profile picture</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...form.register('username')}
                className="bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="Enter your full name"
                {...form.register('full_name')}
                className="bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600"
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-600">{form.formState.errors.full_name.message}</p>
              )}
            </div>

            {/* Bio removed */}
          </div>

          {/* Error Display */}
          {form.formState.errors.root && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-between space-x-2">
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (confirm('This will delete your account and all your posts. Are you sure?')) {
                  await deleteAccount()
                  setOpen(false)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading || isUploading}
            >
              Delete Account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading || isUploading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
