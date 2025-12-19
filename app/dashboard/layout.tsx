import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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

  // Default values
  let user = {
    name: 'User',
    email: 'user@example.com',
    avatar: '',
  }
  
  let team = {
    name: 'Evenza',
    plan: 'Free',
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
          // You might want to map price IDs to names here
          team.plan = 'Pro' 
        }
      } catch (e) {
        // Ignore subscription errors for now
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} team={team} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
