'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  name: string
  company_name: string | null
  onboarding_completed: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          router.push('/login')
          return
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !userProfile) {
          router.push('/onboarding')
          return
        }

        setUser(userProfile)

        // Get subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (!subscriptionError && subscriptionData) {
          setSubscription(subscriptionData)
        }
      } catch (error) {
        console.error('Dashboard auth error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getSubscriptionStatus = () => {
    if (!subscription) return 'free'
    
    const status = subscription.status
    const now = new Date()
    const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null
    
    if (status === 'trialing') return 'trial'
    if (status === 'active') return 'active'
    if (status === 'canceled' && periodEnd && periodEnd > now) return 'active_until_end'
    if (status === 'canceled' && periodEnd && periodEnd <= now) return 'expired'
    if (status === 'past_due') return 'past_due'
    
    return 'free'
  }

  const getStatusBadge = () => {
    const status = getSubscriptionStatus()
    
    switch (status) {
      case 'trial':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Prueba Activa</Badge>
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Suscripción Activa</Badge>
      case 'active_until_end':
        return <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">Activa hasta fin de período</Badge>
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Suscripción Expirada</Badge>
      case 'past_due':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Pago Pendiente</Badge>
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">Plan Gratuito</Badge>
    }
  }

  const getStatusMessage = () => {
    const status = getSubscriptionStatus()
    
    switch (status) {
      case 'trial':
        const trialEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null
        const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
        return `Prueba gratuita activa - ${daysLeft} días restantes`
      case 'active':
        return 'Tienes una suscripción activa'
      case 'active_until_end':
        const endDate = subscription?.current_period_end ? new Date(subscription.current_period_end) : null
        return `Tu suscripción finaliza el ${endDate?.toLocaleDateString('es-MX')}`
      case 'expired':
        return 'Tu suscripción ha expirado'
      case 'past_due':
        return 'Hay un problema con tu pago. Por favor actualiza tu método de pago.'
      default:
        return 'Estás usando el plan gratuito'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subscription Status Banner */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <span className="text-sm text-gray-600">{getStatusMessage()}</span>
          </div>
          <div className="flex items-center gap-2">
            {getSubscriptionStatus() === 'free' && (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/pricing'}
              >
                Ver Planes
              </Button>
            )}
            {getSubscriptionStatus() === 'expired' && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/pricing'}
              >
                Renovar Suscripción
              </Button>
            )}
            {getSubscriptionStatus() === 'past_due' && (
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => window.location.href = '/billing'}
              >
                Actualizar Pago
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido, {user.name}
            </h1>
            <p className="text-gray-600">
              {user.company_name || 'Evenza Dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/profile')}>
              Perfil
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Gestión de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Administra tus clientes y contratos de renta
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Ver Clientes
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Calendario de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Planifica entregas y mantenimiento
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Ver Calendario
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Análisis y Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Monitorea el rendimiento de tu negocio
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              ➕ Nueva Cotización
            </Button>
            <Button variant="outline" className="justify-start">
              📋 Ver Contratos
            </Button>
            <Button variant="outline" className="justify-start">
              📅 Programar Entrega
            </Button>
            <Button variant="outline" className="justify-start">
              📊 Ver Estadísticas
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}