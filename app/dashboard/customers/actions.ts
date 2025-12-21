'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export type Customer = {
  id: string
  full_name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export type CreateCustomerInput = {
  full_name: string
  email?: string
  phone?: string
  address?: string
}

export type UpdateCustomerInput = Partial<CreateCustomerInput> & { id: string }

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

export async function getCustomersList({
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
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  query = query.order(sort, { ascending: order === 'asc' })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching customers:', error)
    throw new Error('Failed to fetch customers')
  }

  return { data, count: count || 0 }
}

export async function createCustomer(input: CreateCustomerInput) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      ...input,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }

  revalidatePath('/dashboard/customers')
  revalidatePath('/dashboard/events') // Refresh events too as they might use customer list
  return data
}

export async function updateCustomer(input: UpdateCustomerInput) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { id, ...updates } = input

  const { data, error } = await supabase
    .from('customers')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    throw new Error('Failed to update customer')
  }

  revalidatePath('/dashboard/customers')
  revalidatePath('/dashboard/events')
  return data
}

export async function deleteCustomer(id: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting customer:', error)
    throw new Error('Failed to delete customer')
  }

  revalidatePath('/dashboard/customers')
  revalidatePath('/dashboard/events')
}
