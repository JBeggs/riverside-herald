/**
 * @deprecated This file is deprecated. Use @/lib/api-server instead for Django REST API.
 * This stub exists to prevent build errors while migrating away from Supabase.
 */

// Stub implementations - do not use
export async function createSupabaseServerClient() {
  throw new Error(
    'Supabase server client is deprecated. Please use serverNewsApi from @/lib/api-server instead.'
  )
}

export function createSupabaseBuildClient() {
  throw new Error(
    'Supabase build client is deprecated. Please use serverNewsApi from @/lib/api-server instead.'
  )
}

export async function createClient() {
  throw new Error(
    'Supabase client is deprecated. Please use serverNewsApi from @/lib/api-server instead.'
  )
}
