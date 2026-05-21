'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function signup(email: string, name: string, password: string) {
  // Validate inputs
  if (!email || !password) return { error: 'Email and password are required' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters' }

  const existing = await supabase.from('users').select('id').eq('email', email).single()
  if (existing.data) return { error: 'Email already registered' }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const { data, error } = await supabase
    .from('users')
    .insert({ email, name, password_hash: passwordHash })
    .select()
    .single()
  if (error || !data) {
    console.error('Signup error:', error)
    return { error: error?.message || 'Could not create account' }
  }
  
  const cookieStore = await cookies();
  cookieStore.set('user_id', data.id, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  redirect('/today')
}

export async function login(email: string, password: string) {
  if (!email || !password) return { error: 'Email and password are required' }

  const { data, error } = await supabase
    .from('users')
    .select('id, password_hash')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Login error:', error)
    if (error.code !== 'PGRST116') {
      return { error: error.message }
    }
  }
  if (!data) return { error: 'No account found with that email' }

  // Verify password
  const isValid = await bcrypt.compare(password, data.password_hash)
  if (!isValid) return { error: 'Incorrect password' }
  
  const cookieStore = await cookies();
  cookieStore.set('user_id', data.id, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  redirect('/today')
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id')
  redirect('/')
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('user_id')?.value ?? null
}

export async function requireAuth(): Promise<string> {
  const id = await getCurrentUserId()
  if (!id) redirect('/login')
  return id
}
