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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { useImageUpload } from '@/hooks/use-image-upload'
import Image from 'next/image'

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

type UploadForm = z.infer<typeof uploadSchema>

interface ImageUploadDialogProps {
  children: React.ReactNode
  onUploadSuccess?: () => void
}

export function ImageUploadDialog({ children, onUploadSuccess }: ImageUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, isUploading } = useImageUpload()

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      form.setError('root', { message: 'Only JPG, PNG, or WEBP images are allowed' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      form.setError('root', { message: 'File size must be less than 5MB' })
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    form.clearErrors('root')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: UploadForm) => {
    if (!selectedFile) {
      form.setError('root', { message: 'Please select an image' })
      return
    }

    const { error } = await uploadImage({
      file: selectedFile,
      title: data.title,
      description: data.description,
    })

    if (!error) {
      setOpen(false)
      form.reset()
      removeFile()
      onUploadSuccess?.()
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUploading) {
      setOpen(newOpen)
      if (!newOpen) {
        form.reset()
        removeFile()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <span>Upload New Photo</span>
          </DialogTitle>
          <DialogDescription>
            Select an image file to upload and share with your followers. Supported formats: JPG, PNG, WEBP (max 5MB).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            {!selectedFile ? (
              <Card
                className={`border-2 border-dashed transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent
                  className="flex flex-col items-center justify-center py-12 text-center"
                  aria-label="Dropzone for image upload"
                >
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Drop your image here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">or click to browse files</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Supports: JPG, PNG, WEBP, GIF (max 5MB)</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardContent className="p-4">
                  <div className="relative">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={previewUrl! || '/placeholder.svg'}
                        alt="Preview"
                        fill
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="/placeholder.svg"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </CardContent>
              </Card>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Give your photo a title..."
                {...form.register('title')}
                className="bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your photo..."
                rows={3}
                {...form.register('description')}
                className="bg-white/50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600 resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {form.formState.errors.root && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isUploading || !selectedFile}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Share Photo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
