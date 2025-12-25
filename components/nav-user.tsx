"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Crown,
  Check,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserSettingsDialog } from "@/components/user-settings-dialog"

export function NavUser({
  user,
  plan = 'Free'
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  plan?: string
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<string>('account')
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [upgradingToPlan, setUpgradingToPlan] = useState<'standard' | 'professional' | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annually'>('monthly')

  // Determine upgrade button visibility and text
  const showUpgradeButton = plan === 'Free' || plan === 'Starter'
  const upgradeButtonText = plan === 'Free' ? 'Upgrade to Starter' : 'Upgrade to Pro'
  const upgradeToPlan = plan === 'Free' ? 'standard' : 'professional'

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

  const openSettings = (tab: string) => {
    setSettingsTab(tab)
    setSettingsOpen(true)
  }

  const handleLogout = async () => {
    try {
      // Clear local storage
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
      }

      // Call server-side logout route
      await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      // Force redirect to landing page
      window.location.href = "/"
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = "/"
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                suppressHydrationWarning
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {showUpgradeButton && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleUpgradeClick}>
                      {plan === 'Free' ? <Sparkles /> : <Crown />}
                      {upgradeButtonText}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => openSettings('account')}>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openSettings('billing')}>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openSettings('notifications')}>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <UserSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab={settingsTab}
      />

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
                  Perfecto para agencias pequeñas que comienzan
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Hasta 100 eventos/mes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Gestión de inventario</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Cotizaciones ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Calendario integrado</span>
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
                    <span>Eventos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Chatbot IA integrado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Reportes avanzados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Integraciones API</span>
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
    </>
  )
}
