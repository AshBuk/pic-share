"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ImageIcon, Heart, MessageCircle, TrendingUp, Calendar } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"

export function AdminStats() {
  const { stats } = useAdmin()

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Posts",
      value: stats.total_posts,
      icon: ImageIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Likes",
      value: stats.total_likes,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Comments",
      value: stats.total_comments,
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Posts Today",
      value: stats.posts_today,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "New Users Today",
      value: stats.users_today,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
