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
      },
    }
  )
}

export async function uploadLogo(formData: FormData) {
  const supabase = await getSupabase()
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading logo:', uploadError)
    throw new Error('Failed to upload logo')
  }

  // Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(filePath)

  // Update User Profile
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

export async function updateCompanyName(name: string) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('users')
        .update({ company_name: name })
        .eq('id', user.id)

    if (error) {
        throw new Error('Failed to update company name')
    }
    
    revalidatePath('/dashboard')
}
