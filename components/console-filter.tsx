/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

'use client'

import { useEffect } from 'react'

export function ConsoleFilter() {
  useEffect(() => {
    // Only filter in development mode
    if (process.env.NODE_ENV !== 'development') return

    // Store original console methods
    const originalWarn = console.warn
    const originalError = console.error

    console.warn = (...args) => {
      const message = args.join(' ')

      // Filter out font preload warnings (Next.js)
      if (message.includes('preloaded with link preload was not used within a few seconds')) {
        return
      }

      // Filter out Cloudflare cookie warnings (external service)
      if (message.includes('Cookie "__cf_bm" has been rejected for invalid domain')) {
        return
      }

      // Filter out WebSocket cookie warnings
      if (message.includes('websocket') && message.includes('Cookie')) {
        return
      }

      originalWarn(...args)
    }

    console.error = (...args) => {
      const message = args.join(' ')

      // Filter out Cloudflare cookie errors (external service)
      if (message.includes('Cookie "__cf_bm" has been rejected for invalid domain')) {
        return
      }

      originalError(...args)
    }

    // Cleanup on unmount
    return () => {
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  return null
}
