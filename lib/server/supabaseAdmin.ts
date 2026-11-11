import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function criarSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  // PRÉVIA LOCAL: sem banco, os repos usam memória (ver criarSupabaseSessionRepo).
  if (process.env.PREVIA_MEMORIA === '1') return {} as SupabaseClient
  if (!url || !key) throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas')
  return createClient(url, key, { auth: { persistSession: false } })
}
