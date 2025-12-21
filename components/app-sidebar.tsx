"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Calendar,
  FileSignature,
  LayoutDashboard,
  Package,
  ReceiptText,
  Users,
  Wrench,
  Command,
  Ticket,
  Settings
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

export function AppSidebar({ user, team, ...props }: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar: string
  }
  team: {
    name: string
    plan: string
    logo?: string
  }
}) {
  const pathname = usePathname()
  const teams = [
    {
      name: team.name,
      logo: Command, // Default fallback
      logoUrl: team.logo, // Pass dynamic logo URL
      plan: team.plan,
    },
  ]

  return (
    <Sidebar 
      collapsible="icon" 
      variant="inset" 
      {...props}
      className="border-none"
      style={{
        '--sidebar': '#ECF0F3',
        backgroundColor: '#ECF0F3',
        boxShadow: '18px 18px 30px #D1D9E6', // Right side shadow mostly
      } as React.CSSProperties}
    >
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Inicio" 
                asChild 
                isActive={pathname === "/dashboard"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard">
                  <LayoutDashboard />
                  <span>Inicio</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarSeparator className="mx-auto !w-[90%]" />

        <SidebarGroup>
          <SidebarGroupLabel>Clientes y Eventos</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Clientes" 
                asChild 
                isActive={pathname === "/dashboard/customers"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard/customers">
                  <Users />
                  <span>Clientes</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Eventos" 
                asChild 
                isActive={pathname === "/dashboard/events"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard/events">
                  <Ticket />
                  <span>Eventos</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Calendario" 
                asChild 
                isActive={pathname === "/dashboard/calendar"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard/calendar">
                  <Calendar />
                  <span>Calendario</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-auto !w-[90%]" />

        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Recibos" 
                asChild 
                isActive={pathname === "/dashboard/invoices"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard/invoices">
                  <ReceiptText />
                  <span>Recibos</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Productos" 
                asChild 
                isActive={pathname === "/dashboard/products"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard/products">
                  <Package />
                  <span>Productos</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Contratos" 
                asChild 
                isActive={pathname === "/dashboard/contracts"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard/contracts">
                  <FileSignature />
                  <span>Contratos</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Mantenimiento" 
                asChild 
                isActive={pathname === "/dashboard/maintenance"}
                className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
              >
                <a href="/dashboard/maintenance">
                  <Wrench />
                  <span>Mantenimiento</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <div className="mt-auto" />
        
        <SidebarSeparator className="mx-auto !w-[90%]" />

        <SidebarGroup className="mt-auto">
             <SidebarGroupLabel>Configuración</SidebarGroupLabel>
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        tooltip="Configuración" 
                        asChild
                        isActive={pathname === "/dashboard/settings"}
                        className="data-[active=true]:bg-background data-[active=true]:shadow-sm"
                    >
                        <a href="/dashboard/settings">
                            <Settings />
                            <span>Configuración</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
