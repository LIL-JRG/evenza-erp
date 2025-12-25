'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export type Contract = {
  id: string
  invoice_id: string
  user_id: string
  customer_id: string
  event_id: string | null
  contract_number: string
  terms_content: string // The terms template content at time of creation
  status: 'pending' | 'signed' | 'cancelled'
  created_at: string
  updated_at: string
  signed_at: string | null
  cancelled_at: string | null
  cancelled_reason: string | null
  // Related data
  invoice?: {
    id: string
    invoice_number: string
    type: string
    subtotal: number
    discount: number
    total: number
    items: any[]
    notes: string | null
  }
  customer?: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    address: string | null
  }
  event?: {
    id: string
    title: string
    event_date: string
    location: string | null
  }
}

async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  )
}

// Generate contract number (similar to invoice number)
async function generateContractNumber(userId: string): Promise<string> {
  const supabase = await getSupabaseClient()

  // Get count of user's contracts
  const { count } = await supabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const contractCount = (count || 0) + 1
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')

  return `CONT-${year}${month}-${String(contractCount).padStart(4, '0')}`
}

// Create contract from invoice
export async function createContractFromInvoice(invoiceId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get invoice data with customer info
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      customer_id,
      event_id,
      user_id,
      type,
      status,
      subtotal,
      discount,
      total,
      items,
      notes,
      customers (
        full_name
      )
    `)
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found')
  }

  // Check if contract already exists for this invoice
  const { data: existingContract } = await supabase
    .from('contracts')
    .select('id')
    .eq('invoice_id', invoiceId)
    .single()

  if (existingContract) {
    return existingContract // Contract already exists, return it
  }

  // Get user's terms template
  const { data: userSettings } = await supabase
    .from('users')
    .select('terms_template')
    .eq('id', user.id)
    .single()

  const termsContent = userSettings?.terms_template || 'TÉRMINOS Y CONDICIONES\n\n[No hay plantilla configurada]'

  // Generate contract number
  const contractNumber = await generateContractNumber(user.id)

  // Create contract
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .insert({
      invoice_id: invoiceId,
      user_id: user.id,
      customer_id: invoice.customer_id,
      event_id: invoice.event_id,
      contract_number: contractNumber,
      customer_name: invoice.customers?.full_name || 'Sin nombre',
      terms_content: termsContent,
      status: 'pending',
    })
    .select()
    .single()

  if (contractError) {
    console.error('Error creating contract:', contractError)
    throw new Error('Failed to create contract')
  }

  revalidatePath('/dashboard/contratos')
  revalidatePath('/dashboard/recibos')

  return contract
}

// Get contracts list
export async function getContractsList(params: {
  page?: number
  limit?: number
  search?: string
  status?: 'all' | 'pending' | 'signed' | 'cancelled'
  sort?: string
  order?: 'asc' | 'desc'
}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    sort = 'created_at',
    order = 'desc',
  } = params

  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  let query = supabase
    .from('contracts')
    .select(`
      *,
      customers (
        id,
        full_name,
        email,
        phone,
        address
      ),
      invoices (
        id,
        invoice_number,
        type,
        subtotal,
        discount,
        total
      ),
      events (
        id,
        title,
        event_date,
        status
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)

  // Filter by status
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Search by contract number or customer name
  if (search) {
    query = query.or(`contract_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
  }

  // Sort
  query = query.order(sort, { ascending: order === 'asc' })

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching contracts:', error)
    throw new Error(`Failed to fetch contracts: ${error.message} (Code: ${error.code})`)
  }

  return {
    contracts: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

// Get contract by ID
export async function getContractById(id: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: contract, error } = await supabase
    .from('contracts')
    .select(`
      *,
      customers (
        id,
        full_name,
        email,
        phone,
        address
      ),
      invoices (
        id,
        invoice_number,
        type,
        subtotal,
        discount,
        total,
        items,
        notes
      ),
      events (
        id,
        title,
        event_date,
        status
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching contract:', error)
    throw new Error('Contract not found')
  }

  // Also get company info
  const { data: companyData } = await supabase
    .from('users')
    .select('company_name, business_address, email, phone')
    .eq('id', user.id)
    .single()

  return {
    ...contract,
    company: companyData
  }
}

// Cancel contract
export async function cancelContract(contractId: string, reason: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('contracts')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason,
    })
    .eq('id', contractId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error cancelling contract:', error)
    throw new Error('Failed to cancel contract')
  }

  revalidatePath('/dashboard/contratos')
  revalidatePath(`/dashboard/contratos/${contractId}`)
}

// Mark contract as signed (for future use)
export async function markContractAsSigned(contractId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('contracts')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
    })
    .eq('id', contractId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error marking contract as signed:', error)
    throw new Error('Failed to mark contract as signed')
  }

  revalidatePath('/dashboard/contratos')
  revalidatePath(`/dashboard/contratos/${contractId}`)
}
