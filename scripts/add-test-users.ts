#!/usr/bin/env tsx

/**
 * Add Real Test Users for Authentication
 * Creates admin users and business users (Mark Gray can author articles)
 */

import dotenv from 'dotenv'
import path from 'path'
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

// Create admin client with service role key to create users
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestUser {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'editor' | 'user'
  description: string
}

const testUsers: TestUser[] = [
  // Admin Users
  {
    email: 'mark.gray@example.com',
    password: 'TestPassword123!',
    full_name: 'Mark Gray',
    role: 'admin',
    description: 'Site Administrator & Article Author'
  },
  {
    email: 'jody.beggs@example.com', 
    password: 'TestPassword123!',
    full_name: 'Jody Beggs',
    role: 'admin', 
    description: 'Site Administrator'
  },
  
  // Business Users (admin@ format)
  {
    email: 'admin@fambrifarms.co.za',
    password: 'FarmAdmin123!',
    full_name: 'Fambri Farms Admin',
    role: 'user',
    description: 'Business Owner - Fambri Farms'
  },
  {
    email: 'admin@paddlepower.co.za', 
    password: 'PaddleAdmin123!',
    full_name: 'Paddle Power Admin',
    role: 'user',
    description: 'Business Owner - Paddle Power'
  },
  {
    email: 'admin@rustyfeather.co.za',
    password: 'FeatherAdmin123!', 
    full_name: 'Rusty Feather Admin',
    role: 'user',
    description: 'Business Owner - The Rusty Feather'
  }
]

async function createTestUser(user: TestUser) {
  console.log(`\n👤 Creating user: ${user.full_name} (${user.email})`)
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name
      }
    })
    
    if (authError) {
      console.error(`   ❌ Auth creation failed: ${authError.message}`)
      return false
    }
    
    console.log(`   ✅ Auth user created: ${authData.user.id}`)
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.error(`   ❌ Profile creation failed: ${profileError.message}`)
      return false
    }
    
    console.log(`   ✅ Profile created with role: ${user.role}`)
    console.log(`   📝 Description: ${user.description}`)
    
    return true
    
  } catch (error) {
    console.error(`   ❌ Unexpected error: ${error}`)
    return false
  }
}

async function linkBusinessOwners() {
  console.log('\n🏢 Linking business owners to their businesses...')
  
  const businessUsers = [
    { email: 'admin@fambrifarms.co.za', businessName: 'Fambri Farms' },
    { email: 'admin@paddlepower.co.za', businessName: 'Paddle Power' },
    { email: 'admin@rustyfeather.co.za', businessName: 'The Rusty Feather' }
  ]
  
  for (const businessUser of businessUsers) {
    try {
      // Get user profile  
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', businessUser.email)
        .single()
        
      if (profileError || !profile) {
        console.log(`   ⚠️  Profile not found for ${businessUser.email}`)
        continue
      }
      
      // Update business owner_id
      const { error: businessError } = await supabase
        .from('businesses')  
        .update({ owner_id: profile.id })
        .eq('name', businessUser.businessName)
        
      if (businessError) {
        console.log(`   ❌ Failed to link ${businessUser.businessName}: ${businessError.message}`)
      } else {
        console.log(`   ✅ Linked ${businessUser.email} to ${businessUser.businessName}`)
      }
      
    } catch (error) {
      console.error(`   ❌ Error linking ${businessUser.businessName}: ${error}`)
    }
  }
}

async function displayLoginCredentials() {
  console.log('\n' + '='.repeat(80))
  console.log('🔐 TEST USER LOGIN CREDENTIALS')
  console.log('='.repeat(80))
  
  console.log('\n👨‍💼 ADMIN USERS:')
  console.log('┌─────────────────────────────────────────────────────────────┐')
  console.log('│ mark.gray@example.com     │ TestPassword123!  │ Full Admin  │')
  console.log('│ jody.beggs@example.com    │ TestPassword123!  │ Full Admin  │')
  console.log('└─────────────────────────────────────────────────────────────┘')
  
  console.log('\n🏢 BUSINESS OWNERS:')
  console.log('┌───────────────────────────────────────────────────────────────────┐') 
  console.log('│ admin@fambrifarms.co.za    │ FarmAdmin123!    │ Fambri Farms     │')
  console.log('│ admin@paddlepower.co.za    │ PaddleAdmin123!  │ Paddle Power     │')
  console.log('│ admin@rustyfeather.co.za   │ FeatherAdmin123! │ Rusty Feather    │')
  console.log('└───────────────────────────────────────────────────────────────────┘')
  
  console.log('\n📝 NOTES:')
  console.log('• Mark Gray has admin role AND can author articles')
  console.log('• Business owners can manage their respective businesses')
  console.log('• All passwords use strong format for testing')
  console.log('• Contact details for admins will be added later as requested')
  console.log('\n' + '='.repeat(80))
}

async function main() {
  console.log('🚀 Creating Real Test Users for Authentication')
  console.log('================================================')
  
  let successCount = 0
  const totalCount = testUsers.length
  
  // Create all users
  for (const user of testUsers) {
    const success = await createTestUser(user)
    if (success) successCount++
  }
  
  // Link business owners to their businesses
  await linkBusinessOwners()
  
  // Display results
  console.log(`\n📊 Results: ${successCount}/${totalCount} users created successfully`)
  
  if (successCount > 0) {
    await displayLoginCredentials()
  }
  
  if (successCount === totalCount) {
    console.log('\n🎉 All test users created successfully!')
    console.log('You can now use these credentials to test the authentication system.')
  } else {
    console.log('\n⚠️  Some users may not have been created. Check the logs above.')
  }
}

// Run the script
main().catch(console.error)