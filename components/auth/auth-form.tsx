/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Camera, Heart, Share2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  fullName: z.string().optional(),
})

type SignInForm = z.infer<typeof signInSchema>
type SignUpForm = z.infer<typeof signUpSchema>

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { signIn, signUp } = useAuth()

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      fullName: '',
    },
  })

  const onSignIn = async (data: SignInForm) => {
    setIsLoading(true)
    setError(null)

    const { error } = await signIn(data.email, data.password)

    if (error) {
      setError(error.message)
    }

    setIsLoading(false)
  }

  const onSignUp = async (data: SignUpForm) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = await signUp(data.email, data.password, data.username, data.fullName)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Check your email for the confirmation link!')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <Camera className="h-8 w-8 text-blue-600" />
              <Heart className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PicShare
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Share your moments with the world</p>
        </div>

        {/* Auth Forms */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2" aria-label="Auth tabs">
              <TabsTrigger value="signin" aria-controls="signin-panel">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" aria-controls="signup-panel">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" id="signin-panel" role="tabpanel" aria-labelledby="Sign In">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Sign in to your account to continue sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signInForm.register('email')}
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-white"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signInForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      {...signInForm.register('password')}
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-white"
                    />
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{signInForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup" id="signup-panel" role="tabpanel" aria-labelledby="Sign Up">
              <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Join PicShare and start sharing your photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signUpForm.register('email')}
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-white"
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      {...signUpForm.register('username')}
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-white"
                    />
                    {signUpForm.formState.errors.username && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name (Optional)</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      {...signUpForm.register('fullName')}
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      {...signUpForm.register('password')}
                      className="bg-white/50 dark:bg-gray-700/50 dark:text-white"
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{signUpForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <Camera className="h-6 w-6 text-blue-600 mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Share Photos</p>
          </div>
          <div className="space-y-2">
            <Heart className="h-6 w-6 text-red-500 mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Like & Comment</p>
          </div>
          <div className="space-y-2">
            <Share2 className="h-6 w-6 text-green-600 mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Connect</p>
          </div>
        </div>
      </div>
    </div>
  )
}
