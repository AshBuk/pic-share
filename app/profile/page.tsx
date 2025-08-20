"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserProfile } from "@/components/profile/user-profile"
import { Button } from "@/components/ui/button"
import { Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Feed
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Camera className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Profile
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main>
          <UserProfile />
        </main>
      </div>
    </ProtectedRoute>
  )
}
