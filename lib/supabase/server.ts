import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export const createServerSupabaseClient = () => {
  // In Next 15, cookies() may return a thenable in some runtimes. Use dynamic access.
  const cookieStore: any = cookies() as any

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const val = cookieStore.get(name)
            if (!val) return undefined
            if (typeof val === 'string') return val
            if (typeof val === 'object' && 'value' in val) return val.value
            return undefined
          } catch {
            return undefined
          }
        },
      },
    }
  )
}
