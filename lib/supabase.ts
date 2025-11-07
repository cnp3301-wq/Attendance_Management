import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
  console.error('⚠️ SUPABASE NOT CONFIGURED!')
  console.error('Please update .env.local with your Supabase credentials.')
  console.error('See QUICKSTART.md for setup instructions.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  name?: string
  created_at: string
  updated_at: string
}

export interface OTP {
  id: string
  email: string
  otp_code: string
  expires_at: string
  is_used: boolean
  created_at: string
}
