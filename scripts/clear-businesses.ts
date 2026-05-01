#!/usr/bin/env tsx

/**
 * Clear Businesses Script
 * 
 * This script clears ONLY businesses from the database.
 * It preserves:
 * - User profiles and authentication
 * - Articles and content
 * - Categories and settings
 * 
 * Use this when you want to clear just businesses.
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

async function clearBusinesses() {
  console.log('🏢 CLEARING BUSINESSES...')
  console.log('✨ Preserving articles, users, and configuration')
  
  try {
    console.log('\n📊 Step 1: Clearing advertisements...')
    
    // Clear advertisements first (depends on businesses)
    const { error: adsError } = await supabase.from('advertisements').delete().gte('created_at', '1970-01-01')
    if (adsError && !adsError.message.includes('does not exist')) throw adsError
    console.log('   ✅ Cleared advertisements')
    
    console.log('\n🏢 Step 2: Clearing business-related data...')
    
    // Clear business-related tables first (dependencies)
    const businessRelatedTables = ['business_media', 'business_reviews']
    for (const table of businessRelatedTables) {
      try {
        const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01')
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ⚠️  Could not clear ${table}:`, error.message)
        } else if (!error) {
          console.log(`   ✅ Cleared ${table}`)
        }
      } catch {
        // Table doesn't exist, ignore
      }
    }
    
    console.log('\n🏢 Step 3: Clearing businesses...')
    
    // Clear businesses
    const { error: businessesError } = await supabase.from('businesses').delete().gte('created_at', '1970-01-01')
    if (businessesError && !businessesError.message.includes('does not exist')) throw businessesError
    console.log('   ✅ Cleared businesses')
    
    console.log('\n🎉 BUSINESSES CLEARED!')
    console.log('')
    console.log('🧹 CLEARED:')
    console.log('   ✅ All businesses and business data')
    console.log('   ✅ All advertisements')
    console.log('   ✅ Business reviews and media')
    console.log('')
    console.log('✨ PRESERVED:')
    console.log('   📰 Articles and content')
    console.log('   👥 User profiles and authentication')
    console.log('   🏷️  Categories and tags')
    console.log('   ⚙️  Site settings and configuration')
    console.log('')
    console.log('🚀 Ready to add fresh businesses!')
    
  } catch (error) {
    console.error('❌ Error clearing businesses:', error)
    console.log('')
    console.log('💡 This might happen if:')
    console.log('   - Tables don\'t exist yet (database not set up)')
    console.log('   - Database connection issues')
    console.log('   - Permission problems with service role key')
    console.log('   - Some data has foreign key constraints')
    process.exit(1)
  }
}

// Execute the clear operation
clearBusinesses().then(() => {
  console.log('🏢 Businesses cleared!')
  process.exit(0)
})