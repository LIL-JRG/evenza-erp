import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Regular client for user operations
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    
    const hashedPassword = await this.hashPassword(userData.password)
    console.log('Password hashed successfully')
    
    // Create user in a transaction-like manner using admin client
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: userData.email.toLowerCase(),
        name: userData.name,
        company_name: userData.company_name,
        email_verified: false,
        onboarding_completed: false,
      } as any)
      .select()
      .single()

    console.log('User creation result:', { user, userError })
    
    if (userError || !user) {
      console.error('User creation failed:', userError)
      throw new Error('Failed to create user')
    }

    console.log('User created successfully, storing credentials...')

    // Store password hash in separate table
    const { error: credError } = await supabaseAdmin
      .from('user_credentials')
      .insert({
        user_id: user.id,
        password_hash: hashedPassword,
      })

    console.log('Credential storage result:', { credError })

    if (credError) {
      console.error('Credential storage failed:', credError)
      // Rollback user creation if password storage fails
      await supabaseAdmin.from('users').delete().eq('id', user.id)
      throw new Error('Failed to create user credentials')
    }

    console.log('User and credentials created successfully')
    return user as AuthUser
  }

  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const user = await this.getUserByEmail(credentials.email)
    
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Get password hash from database using admin client
    const { data: credentialsData, error: credError } = await supabaseAdmin
      .from('user_credentials')
      .select('password_hash')
      .eq('user_id', user.id)
      .single()

    if (credError || !credentialsData) {
      throw new Error('Invalid credentials')
    }

    const isValid = await this.verifyPassword(credentials.password, credentialsData.password_hash)
    if (!isValid) {
      throw new Error('Invalid credentials')
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