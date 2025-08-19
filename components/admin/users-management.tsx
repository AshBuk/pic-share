"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, User, Crown, Ban } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"
import type { Profile } from "@/lib/supabase/types"
import { formatDistanceToNow } from "date-fns"

export function UsersManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const { fetchAllUsers, updateUserRole, banUser } = useAdmin()

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await fetchAllUsers()
    if (data) {
      setUsers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, role: "user" | "admin" | "moderator") => {
    const { error } = await updateUserRole(userId, role)
    if (!error) {
      fetchUsers() // Refresh the list
    }
  }

  const handleBanUser = async (userId: string) => {
    if (confirm("Are you sure you want to ban this user?")) {
      const { error } = await banUser(userId)
      if (!error) {
        fetchUsers()
      }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />
      case "moderator":
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "moderator":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {user.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{user.full_name || user.username}</p>
                    <Badge className={`${getRoleColor(user.role || "user")} flex items-center space-x-1`}>
                      {getRoleIcon(user.role || "user")}
                      <span className="capitalize">{user.role || "user"}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="text-xs text-gray-400">
                    Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Select
                  value={user.role || "user"}
                  onValueChange={(role: "user" | "admin" | "moderator") => handleRoleChange(user.id, role)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBanUser(user.id)} className="text-red-600">
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
