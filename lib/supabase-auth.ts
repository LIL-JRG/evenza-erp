import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '7d'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  email_verified: boolean
  onboarding_completed: boolean
  company_name?: string
  role?: string
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  company_name?: string
}

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class AuthService {
  static generateToken(user: AuthUser): string {
    const payload: Partial<JWTPayload> = {
      userId: user.id,
      email: user.email,
    }
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static async getUserByEmail(email: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !data) return null
    return data as AuthUser
  }

  static async getUserById(id: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as AuthUser
  }

  static async createUser(userData: RegisterData): Promise<AuthUser> {
    console.log('Creating user with email:', userData.email)
    
    // First, sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email.toLowerCase(),
      password: userData.password,
    })

    if (authError) {
      console.error('Supabase auth signup failed:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user')
    }

    console.log('Auth user created:', authData.user.id)

    // Now create the user profile in our users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email.toLowerCase(),
        name: userData.name,
        company_name: userData.company_name,
        email_verified: false,
        onboarding_completed: false,
      } as any)
      .select()
      .single()

    console.log('User profile creation result:', { user, userError })
    
    if (userError || !user) {
      console.error('User profile creation failed:', userError)
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error('Failed to create user profile')
    }

    console.log('User and credentials created successfully')
    return user as AuthUser
  }

  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (authError) {
      console.error('Supabase auth login failed:', authError)
      throw new Error('Invalid credentials')
    }

    if (!authData.user) {
      throw new Error('Invalid credentials')
    }

    // Get user profile
    const user = await this.getUserById(authData.user.id)
    if (!user) {
      throw new Error('User profile not found')
    }

    const token = this.generateToken(user)
    return { user, token }
  }

  static async register(userData: RegisterData): Promise<{ user: AuthUser; token: string }> {
    const existingUser = await this.getUserByEmail(userData.email)
    
    if (existingUser) {
      throw new Error('User already exists')
    }

    const user = await this.createUser(userData)
    const token = this.generateToken(user)
    
    return { user, token }
  }

  static async updateUser(id: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error('Failed to update user')
    return data as AuthUser
  }

  static extractTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    return authHeader.substring(7)
  }

  static async getUserFromRequest(request: Request): Promise<AuthUser | null> {
    const token = this.extractTokenFromRequest(request)
    
    if (!token) return null

    try {
      const payload = this.verifyToken(token)
      return await this.getUserById(payload.userId)
    } catch {
      return null
    }
  }
}