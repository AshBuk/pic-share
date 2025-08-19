"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useAdmin } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Plus, LogOut, User, Shield } from "lucide-react"
import { ImageUploadDialog } from "@/components/upload/image-upload-dialog"
import { PostsFeed } from "@/components/feed/posts-feed"
import Link from "next/link"

function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const { isAdmin } = useAdmin()

  const handleUploadSuccess = () => {
    // Feed will automatically refresh via real-time subscriptions
    console.log("Upload successful!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PicShare
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <ImageUploadDialog onUploadSuccess={handleUploadSuccess}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </ImageUploadDialog>

            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}

            <Link href="/profile">
              <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{profile?.username || user?.email}</span>
              </div>
            </Link>

            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <PostsFeed onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/profile">
                  <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile?.full_name || profile?.username}</p>
                      <p className="text-sm text-gray-500">@{profile?.username}</p>
                    </div>
                  </div>
                </Link>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-semibold">0</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div>
                    <p className="font-semibold">0</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div>
                    <p className="font-semibold">0</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                </div>
                <Link href="/profile">
                  <Button variant="outline" className="w-full bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Upload */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Share Something</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploadDialog onUploadSuccess={handleUploadSuccess}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </ImageUploadDialog>
              </CardContent>
            </Card>

            {/* Admin Panel Link */}
            {isAdmin && (
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <span>Admin Panel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/admin">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700">
                      <Shield className="h-4 w-4 mr-2" />
                      Open Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Suggested for you</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 text-center py-4">
                  Start following people to see suggestions here!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
