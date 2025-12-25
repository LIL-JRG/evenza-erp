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
  Sparkles,
  Crown
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

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
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false)
  const [upgradingToPlan, setUpgradingToPlan] = React.useState<'standard' | 'professional' | null>(null)
  const [selectedPeriod, setSelectedPeriod] = React.useState<'monthly' | 'annually'>('monthly')

  const teams = [
    {
      name: team.name,
      logo: Command, // Default fallback
      logoUrl: team.logo, // Pass dynamic logo URL
      plan: team.plan,
    },
  ]

  // Determine which plan to show upgrade button for
  const showUpgradeButton = team.plan === 'Free' || team.plan === 'Starter'
  const upgradeButtonText = team.plan === 'Free' ? 'Upgrade to Starter' : 'Upgrade to Pro'
  const upgradeToPlan = team.plan === 'Free' ? 'standard' : 'professional'

  const handleUpgradeClick = () => {
    setUpgradingToPlan(upgradeToPlan)
    setUpgradeDialogOpen(true)
  }

  const handleCheckout = async (selectedPlan: 'standard' | 'professional') => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          period: selectedPeriod
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la solicitud. Por favor intenta de nuevo.')
    }
  }

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
                className="data-[active=true]:bg-[#ECF0F3] data-[active=true]:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF] transition-all duration-200"
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
                isActive={pathname === "/dashboard/clientes"}
                className="data-[active=true]:bg-[#ECF0F3] data-[active=true]:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF] transition-all duration-200"
              >
                <a href="/dashboard/clientes">
                  <Users />
                  <span>Clientes</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Eventos"
                asChild
                isActive={pathname === "/dashboard/eventos"}
                className="data-[active=true]:bg-[#ECF0F3] data-[active=true]:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF] transition-all duration-200"
              >
                <a href="/dashboard/eventos">
                  <Ticket />
                  <span>Eventos</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Calendario"
                asChild
                isActive={pathname === "/dashboard/calendario"}
                className="data-[active=true]:bg-[#ECF0F3] data-[active=true]:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF] transition-all duration-200"
              >
                <a href="/dashboard/calendario">
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
                isActive={pathname === "/dashboard/recibos"}
                className="data-[active=true]:bg-[#ECF0F3] data-[active=true]:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF] transition-all duration-200"
              >
                <a href="/dashboard/recibos">
                  <ReceiptText />
                  <span>Recibos</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Productos"
                asChild
                isActive={pathname === "/dashboard/productos"}
                className="data-[active=true]:bg-[#ECF0F3] data-[active=true]:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF] transition-all duration-200"
              >
                <a href="/dashboard/productos">
                  <Package />
                  <span>Productos</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Contratos"
                asChild
                isActive={pathname === "/dashboard/contratos"}
                className="data-[active=true]:bg-[#ECF0F3] data-[active=true]:shadow-[inset_4px_4px_8px_#D1D9E6,inset_-4px_-4px_8px_#FFFFFF] hover:shadow-[4px_4px_8px_#D1D9E6,-4px_-4px_8px_#FFFFFF] transition-all duration-200"
              >
                <a href="/dashboard/contratos">
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

        {/* Upgrade Button */}
        {showUpgradeButton && (
          <SidebarGroup className="px-3 pb-4">
            <Button
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg group-data-[collapsible=icon]:hidden"
            >
              {team.plan === 'Free' ? <Sparkles className="mr-2 h-4 w-4" /> : <Crown className="mr-2 h-4 w-4" />}
              {upgradeButtonText}
            </Button>
          </SidebarGroup>
        )}

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} plan={team.plan} />
      </SidebarFooter>
      <SidebarRail />

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-y-auto border-none"
          style={{
            backgroundColor: '#ECF0F3',
            boxShadow: '8px 8px 16px #D1D9E6, -8px -8px 16px rgba(255, 255, 255, 0.5)'
          }}
        >
          <DialogHeader>
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  backgroundColor: '#ECF0F3',
                  boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                }}
              >
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <DialogTitle className="text-3xl font-bold text-foreground">
                Elige tu Plan
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Selecciona el plan que mejor se adapte a tu negocio
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Period Toggle */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex rounded-lg p-1"
              style={{
                backgroundColor: '#ECF0F3',
                boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === 'monthly' ? 'text-white' : 'text-muted-foreground'
                }`}
                style={selectedPeriod === 'monthly' ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                } : {}}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('annually')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === 'annually' ? 'text-white' : 'text-muted-foreground'
                }`}
                style={selectedPeriod === 'annually' ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                } : {}}
              >
                Anual <span className="text-xs ml-1">(Ahorra 17%)</span>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Starter Plan */}
            <div
              onClick={() => handleCheckout('standard')}
              className="rounded-xl p-6 cursor-pointer transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: '#ECF0F3',
                boxShadow: '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
              }}
            >
              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{
                    backgroundColor: '#ECF0F3',
                    boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                  }}
                >
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Starter
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${selectedPeriod === 'monthly' ? '199' : '1,990'}
                  </span>
                  <span className="text-muted-foreground">
                    /{selectedPeriod === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Para agencias pequeñas que comienzan
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Hasta 100 clientes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Hasta 50 eventos/mes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Hasta 50 productos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Calendario avanzado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Plantilla colorida</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Términos editables</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Descuentos por evento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Soporte por email</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Plan */}
            <div
              onClick={() => handleCheckout('professional')}
              className="rounded-xl p-6 cursor-pointer transition-all duration-200 relative hover:scale-105"
              style={{
                backgroundColor: '#ECF0F3',
                boxShadow: '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
              }}
            >
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-purple-700">
                  POPULAR
                </div>
              </div>

              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{
                    backgroundColor: '#ECF0F3',
                    boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                  }}
                >
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Professional
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    ${selectedPeriod === 'monthly' ? '349' : '3,490'}
                  </span>
                  <span className="text-muted-foreground">
                    /{selectedPeriod === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
                <div className="bg-yellow-400 text-purple-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  7 DÍAS GRATIS
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Para agencias en crecimiento
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Todo de Starter, más:</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Clientes ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Eventos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Productos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Contrato Legal editable</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Chatbot IA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Exportar a PDF/CSV</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Soporte prioritario</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
