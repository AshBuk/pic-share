import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storageKey: 'picshare-auth',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          flowType: 'pkce',
        },
        global: {
          headers: {
            'x-application-name': 'picshare'
          }
        }
      }
    )
  }
  return supabaseInstance
}
