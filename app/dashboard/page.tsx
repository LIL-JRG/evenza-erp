import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

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
      userName = profile?.name || user.email?.split('@')[0] || 'Usuario'
  }

  return (
    <div className="flex flex-col gap-4">
      <DashboardStats userName={userName} />
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  )
}
