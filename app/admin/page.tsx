"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAdmin } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ArrowLeft, BarChart3, Users } from "lucide-react"
import { AdminStats } from "@/components/admin/admin-stats"
import { UsersManagement } from "@/components/admin/users-management"
import { PostsManagement } from "@/components/admin/posts-management"
import Link from "next/link"
import { ImageIcon } from "lucide-react"

function AdminDashboard() {
  const { isAdmin, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-8 w-8 animate-pulse mx-auto text-blue-600" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="h-16 w-16 text-red-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
            </div>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Feed
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>Posts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Platform Analytics</h2>
              <AdminStats />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <UsersManagement />
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
              <PostsManagement />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
