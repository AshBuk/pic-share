/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, X, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'
import { usePostActions } from '@/hooks/use-post-actions'
import type { Profile, Comment as CommentType } from '@/lib/supabase/types'

type CommentWithProfile = CommentType & { profiles: Profile }

interface CommentsSectionProps {
  postId: string
  comments?: CommentWithProfile[]
  maxHeightClass?: string
}

export function CommentsSection({ postId, comments, maxHeightClass = 'max-h-60' }: CommentsSectionProps) {
  const { user } = useAuth()
  const { addComment, updateComment, deleteComment, isLoading } = usePostActions()
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const { error } = await addComment(postId, commentText)
    if (!error) {
      setCommentText('')
      // Note: Real comments update will come from the database/real-time subscription
      // This is just a placeholder - actual update happens via refreshFeedComments()
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      {comments && comments.length > 0 ? (
        <div className={`space-y-3 ${maxHeightClass} overflow-y-auto`}>
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.profiles?.avatar_url || ''} />
                <AvatarFallback className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium">{comment.profiles?.username}</p>
                  {editingId === comment.id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        const { error } = await updateComment(comment.id, editingText)
                        if (!error) {
                          setEditingId(null)
                          // Note: Real comments update will come from the database/real-time subscription
                          // This is just a placeholder - actual update happens via refreshFeedComments()
                        }
                      }}
                      className="mt-1 flex items-center space-x-2"
                    >
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                        aria-label="Edit comment"
                      />
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-200">{comment.content}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
              {user?.id === comment.user_id && editingId !== comment.id && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(comment.id)
                      setEditingText(comment.content)
                    }}
                    aria-label="Edit comment"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      const { error } = await deleteComment(comment.id)
                      if (!error) {
                        // Note: Real comments update will come from the database/real-time subscription
                        // This is just a placeholder - actual update happens via refreshFeedComments()
                      }
                    }}
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No comments yet.</p>
      )}

      {user && (
        <form onSubmit={handleAdd} className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
              {user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex space-x-2">
            <Input
              aria-label="Add a comment"
              className="bg-gray-100 dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-600"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!commentText.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              aria-label="Send comment"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
