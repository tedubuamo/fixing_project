import { supabase } from './supabase'

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('User').select('*').limit(1)
    
    if (error) {
      console.error('Database connection error:', error.message)
      return false
    }

    console.log('Database connected successfully!')
    return true
  } catch (err) {
    console.error('Failed to connect to database:', err)
    return false
  }
} 