import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import DashboardClient from "@/components/dashboard/dashboard-client"

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser()
  
  let userName = 'Usuario'
  if (user) {
      const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).single()
      const fullName = profile?.name || user.email?.split('@')[0] || 'Usuario'
      // Extract only the first name
      userName = fullName.split(' ')[0]
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen bg-[#ECF0F3]">
      <DashboardStats userName={userName} />
      <DashboardClient userName={userName} />
      <div className="hidden md:block bg-[#ECF0F3] min-h-[100vh] flex-1 rounded-xl md:min-h-min shadow-[inset_9px_9px_16px_#D1D9E6,inset_-9px_-9px_16px_#FFFFFF]" />
    </div>
  )
}
