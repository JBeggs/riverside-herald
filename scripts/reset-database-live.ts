#!/usr/bin/env tsx

/**
 * Reset Database - Live Schema Version
 * 
 * This script resets the database based on the ACTUAL live schema,
 * not the basic database.sql file. It handles all the real tables
 * that exist in your live Supabase database.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

async function resetLiveDatabase() {
  console.log('🔥 RESETTING LIVE DATABASE TO EMPTY STATE...')
  console.log('⚠️  WARNING: This will delete ALL data including users!')
  
  try {
    // Clear tables in dependency order based on actual live schema
    
    console.log('\n📊 Step 1: Clearing dependent content...')
    
    // Clear tables that depend on other tables first
    const dependentTables = [
      'advertisements',
      'business_media', 
      'article_media',
      'user_sessions',
      'notifications',
      'testimonials',
      'team_members'
    ]
    
    for (const table of dependentTables) {
      try {
        const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01')
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Could not clear ${table}: ${error.message}`)
        } else if (!error) {
          console.log(`   ✅ Cleared ${table}`)
        }
      } catch (err) {
        console.log(`   ⚠️  Error with ${table}:`, err)
      }
    }
    
    console.log('\n📰 Step 2: Clearing main content...')
    
    // Clear main content tables
    const contentTables = [
      'articles',
      'businesses', 
      'galleries',
      'media'
    ]
    
    for (const table of contentTables) {
      try {
        const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01')
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Could not clear ${table}: ${error.message}`)
        } else if (!error) {
          console.log(`   ✅ Cleared ${table}`)
        }
      } catch (err) {
        console.log(`   ⚠️  Error with ${table}:`, err)
      }
    }
    
    console.log('\n📁 Step 3: Clearing other content...')
    
    // Clear other content tables
    const otherTables = [
      'content_imports',
      'audio_recordings'
    ]
    
    for (const table of otherTables) {
      try {
        const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01')
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Could not clear ${table}: ${error.message}`)
        } else if (!error) {
          console.log(`   ✅ Cleared ${table}`)
        }
      } catch (err) {
        console.log(`   ⚠️  Error with ${table}:`, err)
      }
    }
    
    console.log('\n👥 Step 4: Clearing user data...')
    
    // Get all user IDs before clearing profiles
    const { data: users } = await supabase.from('profiles').select('id')
    const userIds = users?.map(user => user.id) || []
    
    // Clear profiles
    const { error: profilesError } = await supabase.from('profiles').delete().gte('created_at', '1970-01-01')
    if (profilesError && !profilesError.message.includes('does not exist')) {
      console.log(`   ⚠️  Could not clear profiles: ${profilesError.message}`)
    } else if (!profilesError) {
      console.log('   ✅ Cleared profiles')
    }
    
    // Clear auth users
    if (userIds.length > 0) {
      console.log(`   🗑️  Removing ${userIds.length} auth users...`)
      for (const userId of userIds) {
        try {
          await supabase.auth.admin.deleteUser(userId)
        } catch {
          console.log(`   ⚠️  Could not delete auth user ${userId}`)
        }
      }
      console.log('   ✅ Cleared auth users')
    }
    
    console.log('\n🏷️  Step 5: Clearing configuration...')
    
    // Clear configuration tables
    const configTables = [
      'rss_sources',
      'categories',
      'site_settings'
    ]
    
    for (const table of configTables) {
      try {
        const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01')
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Could not clear ${table}: ${error.message}`)
        } else if (!error) {
          console.log(`   ✅ Cleared ${table}`)
        }
      } catch (err) {
        console.log(`   ⚠️  Error with ${table}:`, err)
      }
    }
    
    console.log('\n🎉 LIVE DATABASE COMPLETELY RESET!')
    console.log('')
    console.log('🔥 ALL DATA CLEARED from live schema tables')
    console.log('')
    console.log('✨ Your database is now completely empty and ready for fresh setup!')
    console.log('')
    console.log('🚀 Next steps:')
    console.log('   1. Run: npx tsx scripts/add-test-users.ts (to create users)')
    console.log('   2. Add categories, businesses, and articles as needed')
    
  } catch (error) {
    console.error('❌ Error resetting live database:', error)
    console.log('')
    console.log('💡 This might happen if:')
    console.log('   - Database connection issues')
    console.log('   - Permission problems with service role key')
    console.log('   - Foreign key constraints preventing deletion')
    process.exit(1)
  }
}

// Execute the reset operation
resetLiveDatabase().then(() => {
  console.log('🔥 Live database reset complete!')
  process.exit(0)
})