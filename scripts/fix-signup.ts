#!/usr/bin/env tsx

/**
 * Fix User Signup Issues
 * Adds missing INSERT policy for profiles table and automatic profile creation trigger
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables (optional; script only prints SQL paths)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function fixSignupPolicies() {
  console.log('🔧 Fixing user signup policies...')
  
  try {
    console.log('📝 Manual execution required - Supabase doesn\'t allow direct SQL execution via client')
    console.log('')
    console.log('🔍 Please follow these steps:')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Navigate to SQL Editor (left sidebar)')
    console.log('4. Create a new query')
    console.log('5. Copy and paste the following SQL:')
    console.log('')
    console.log('=================== SQL TO RUN ===================')
    
    // Read and display the SQL file
    const sqlPath = path.join(process.cwd(), 'src/lib/fix-signup-policies.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    console.log(sql)
    
    console.log('=================== END SQL ===================')
    console.log('')
    console.log('6. Click "Run" to execute the SQL')
    console.log('')
    console.log('📋 What this will fix:')
    console.log('   • Add INSERT policy for profiles table')
    console.log('   • Create automatic profile creation trigger')
    console.log('   • Set proper permissions for authenticated users')
    console.log('')
    console.log('🎉 After running this SQL, normal user signup should work!')
    
  } catch (error) {
    console.error('❌ Error reading SQL file:', error)
    process.exit(1)
  }
}

// Run the fix
fixSignupPolicies()