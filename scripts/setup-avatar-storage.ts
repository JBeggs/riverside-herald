#!/usr/bin/env tsx

/**
 * Setup Avatar Storage Bucket
 * Creates the avatars bucket and sets up proper policies
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAvatarStorage() {
  console.log('🗄️  Setting up avatar storage...')
  
  try {
    // Step 1: Create avatars bucket
    console.log('1️⃣ Creating avatars bucket...')
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.id === 'avatars')
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket already exists')
    } else {
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError.message)
        return
      }
      
      console.log('✅ Avatars bucket created successfully')
    }
    
    // Step 2: Setup policies via SQL
    console.log('2️⃣ Setting up storage policies...')
    console.log('')
    console.log('📝 Please run the following SQL in your Supabase dashboard:')
    console.log('Dashboard → SQL Editor → New Query')
    console.log('')
    console.log('=================== SQL TO RUN ===================')
    
    const sqlPath = path.join(process.cwd(), 'src/lib/setup-avatar-storage.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    console.log(sql)
    
    console.log('=================== END SQL ===================')
    console.log('')
    console.log('📋 What this SQL does:')
    console.log('   • Creates avatars bucket (if not exists)')
    console.log('   • Sets up RLS policies for secure access')
    console.log('   • Allows users to upload/update/delete own avatars')
    console.log('   • Allows public read access to all avatars')
    console.log('')
    console.log('🎉 After running the SQL, avatar uploads will work!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupAvatarStorage()