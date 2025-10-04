// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    // Ajuda a detectar env quebrada
    // eslint-disable-next-line no-console
    console.warn('[SUPABASE] Variáveis ausentes:', { hasUrl: !!url, hasAnon: !!anon })
  }

  return createSupabaseClient(url!, anon!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}
