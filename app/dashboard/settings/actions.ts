'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

// Update company information
export async function updateCompanyInfo(data: {
  company_name?: string
  business_address?: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating company info:', error)
    throw new Error('Failed to update company information')
  }

  revalidatePath('/dashboard')
}

// Upload company logo
export async function uploadCompanyLogo(formData: FormData) {
  const supabase = await getSupabase()
  const file = formData.get('file') as File

  if (!file) throw new Error('No file provided')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading logo:', uploadError)
    throw new Error('Failed to upload logo')
  }

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('users')
    .update({ logo_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating user profile:', updateError)
    throw new Error('Failed to update user profile')
  }

  revalidatePath('/dashboard')
  return publicUrl
}

// Upload user avatar
export async function uploadUserAvatar(formData: FormData) {
  const supabase = await getSupabase()
  const file = formData.get('file') as File

  if (!file) throw new Error('No file provided')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    throw new Error('Failed to upload avatar')
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating user profile:', updateError)
    throw new Error('Failed to update user profile')
  }

  revalidatePath('/dashboard')
  return publicUrl
}

// Update user profile (name, phone)
export async function updateUserProfile(data: {
  name?: string
  phone?: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update user profile')
  }

  revalidatePath('/dashboard')
}

// Change password
export async function changePassword(newPassword: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Error changing password:', error)
    throw new Error('Failed to change password')
  }
}

// Update email (requires verification)
export async function updateEmail(newEmail: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (error) {
    console.error('Error updating email:', error)
    throw new Error('Failed to update email')
  }

  // Email change requires verification, user will get an email
  return { message: 'Verification email sent to new address' }
}

// Toggle IVA setting
export async function toggleIVA(enabled: boolean) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update({ enable_iva: enabled })
    .eq('id', user.id)

  if (error) {
    console.error('Error toggling IVA:', error)
    throw new Error('Failed to update IVA setting')
  }

  revalidatePath('/dashboard')
}

// Get current user settings
export async function getUserSettings() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('users')
    .select('name, email, phone, company_name, business_address, logo_url, avatar_url, enable_iva, legal_contract_template, terms_template, business_entity_type, subscription_tier')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user settings:', error)
    throw new Error('Failed to fetch user settings')
  }

  return data
}

// Update contract templates
export async function updateContractTemplate(data: {
  legal_contract_template?: string
  terms_template?: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating contract template:', error)
    throw new Error('Failed to update contract template')
  }

  revalidatePath('/dashboard')
}
