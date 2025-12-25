'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPlanLimits, canPerformAction, getLimitReachedMessage, type SubscriptionTier } from '@/lib/plan-limits'

// --- Types ---

export type Product = {
  id: string
  name: string
  description?: string | null
  sku?: string | null
  price: number
  stock: number
  image_url?: string | null
  category?: string | null
  created_at: string
  updated_at: string
}

export type CreateProductInput = {
  name: string
  description?: string
  sku?: string
  price: number
  stock: number
  category?: string
  image?: File | null // For server action handling
}

export type UpdateProductInput = Partial<Omit<CreateProductInput, 'image'>> & { 
  id: string 
  image?: File | null 
  image_url?: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  created_at: string
}

// --- Helpers ---

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )
}

async function uploadImage(file: File): Promise<string> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { error } = await supabase.storage
    .from('products')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(fileName)

  return data.publicUrl
}

// --- Actions ---

export async function getProducts({
  page = 1,
  limit = 10,
  search = '',
  sort = 'created_at',
  order = 'desc'
}: {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
  }

  query = query.order(sort, { ascending: order === 'asc' })
  
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }

  return { data, count: count || 0 }
}

export async function createProduct(formData: FormData) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get user's subscription tier
  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const subscriptionTier = (userProfile?.subscription_tier || 'free') as SubscriptionTier

  // Get current product count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const currentCount = count || 0

  // Check if user can add more products
  const limits = getPlanLimits(subscriptionTier)
  if (!canPerformAction(currentCount, limits.products)) {
    throw new Error(getLimitReachedMessage('products', subscriptionTier))
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  let sku = formData.get('sku') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const stock = parseInt(formData.get('stock') as string) || 0
  const category = formData.get('category') as string
  const image = formData.get('image') as File | null

  // Auto-generate SKU if empty
  if (!sku) {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    sku = `PRD-${timestamp}${random}`
  }

  let image_url = null
  if (image && image.size > 0) {
    image_url = await uploadImage(image)
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      name,
      description,
      sku,
      price,
      stock,
      category,
      image_url,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    throw new Error('Failed to create product')
  }

  revalidatePath('/dashboard/productos')
  return data
}

export async function updateProduct(formData: FormData) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sku = formData.get('sku') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const category = formData.get('category') as string
  const image = formData.get('image') as File | null

  const updates: any = {
    name,
    description,
    sku,
    price,
    stock,
    category,
    updated_at: new Date().toISOString()
  }

  if (image && image.size > 0) {
    updates.image_url = await uploadImage(image)
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    throw new Error('Failed to update product')
  }

  revalidatePath('/dashboard/productos')
  return data
}

export async function deleteProduct(id: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Optional: Delete image from storage if needed
  // For now just delete record
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting product:', error)
    throw new Error('Failed to delete product')
  }

  revalidatePath('/dashboard/productos')
}

export async function getCategories() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data
}

export async function createCategory(name: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('product_categories')
    .insert({
      user_id: user.id,
      name,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    throw new Error('Failed to create category')
  }

  revalidatePath('/dashboard/productos')
  return data
}
