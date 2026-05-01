#!/usr/bin/env tsx

/**
 * Temporary: Disable RLS on storage.objects for testing
 * This is not recommended for production but will allow uploads to work
 */

import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

async function disableStorageRLS() {
  console.log('⚠️  TEMPORARILY disabling RLS on storage.objects for testing...')
  console.log('⚠️  This is NOT recommended for production!')
  console.log('')
  
  console.log('🛠️  **Manual SQL Fix:**')
  console.log('   1. Go to Supabase Dashboard → SQL Editor')
  console.log('   2. Run this SQL as the project owner:')
  console.log('')
  console.log('   ```sql')
  console.log('   -- Temporarily disable RLS for testing')
  console.log('   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;')
  console.log('   ```')
  console.log('')
  console.log('   This will allow uploads to work immediately.')
  console.log('   You can re-enable RLS later with proper policies.')
  console.log('')
  console.log('⚡ **Or try the bucket-level approach:**')
  console.log('   1. Dashboard → Storage → avatars bucket')
  console.log('   2. Settings tab → Public: ON')
  console.log('   3. Policies tab → "New Policy"')
  console.log('   4. Create simple INSERT policy for authenticated users')
}

disableStorageRLS()