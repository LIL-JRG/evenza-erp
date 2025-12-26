import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ChatWidget } from "@/components/dashboard/chat-widget"
import { DynamicBreadcrumb } from "@/components/dashboard/dynamic-breadcrumb"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  const { data: { session } } = await supabase.auth.getSession()

  const cookie = cookieStore.get("sidebar_state")
  const defaultOpen = cookie ? cookie.value === "true" : true

  // Default values
  let user = {
    name: 'User',
    email: 'user@example.com',
    avatar: '',
  }
  
  let team = {
    name: 'Evenza',
    plan: 'Free',
    logo: undefined as string | undefined,
  }

  if (session?.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      user = {
        name: profile.name || session.user.email?.split('@')[0] || 'User',
        email: profile.email || session.user.email || '',
        avatar: profile.avatar_url || '',
      }

      team = {
        name: profile.company_name || 'My Company',
        plan: 'Free', // Default
        logo: profile.logo_url || undefined, // Use user's custom logo
      }
      
      // Check subscription if available
      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('stripe_price_id, status')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single()
          
        if (subscription) {
          // Map price IDs to plan names
          const priceId = subscription.stripe_price_id
          const starterPrices = [
            process.env.STRIPE_PRICE_STANDARD_MONTHLY, 
            process.env.STRIPE_PRICE_STANDARD_ANNUALLY
          ]
          const professionalPrices = [
            process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY, 
            process.env.STRIPE_PRICE_PROFESSIONAL_ANNUALLY
          ]

          if (starterPrices.includes(priceId)) {
            team.plan = 'Starter'
          } else if (professionalPrices.includes(priceId)) {
            team.plan = 'Professional'
          } else {
            team.plan = 'Custom' // Fallback for unknown plans
          }
        }
      } catch (e) {
        // Ignore subscription errors for now
      }
    }
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen} style={{ backgroundColor: '#ECF0F3' }}>
      <AppSidebar user={user} team={team} />
      <SidebarInset className="bg-[#ECF0F3] shadow-none">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 print:hidden">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 print:p-0">
          {children}
        </div>
        {/* Only show ChatWidget for Professional plan users */}
        {team.plan === 'Professional' && <ChatWidget className="print:hidden" />}
      </SidebarInset>
    </SidebarProvider>
  )
}
