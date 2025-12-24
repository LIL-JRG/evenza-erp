'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { setPendingCheckout } from '@/lib/checkout-helper'
import { Building2, Store, Check, ArrowRight, ArrowLeft, Zap, Crown, Sparkles, Phone, Gift, Award } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [businessEntityType, setBusinessEntityType] = useState<'legal' | 'local' | null>(null)
  const [formData, setFormData] = useState({
    // Common fields
    company_name: '',
    phone: '',
    business_address: '',
    business_type: 'furniture_rental', // Default to Renta de Muebles
    // Legal entity specific fields
    legal_name: '',
    rfc: '',
    legal_representative: '',
    fiscal_address: '',
  })
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'standard' | 'professional' | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annually'>('monthly')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          window.location.href = '/login'
          return
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !userProfile) {
          await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              name: (user.user_metadata as any)?.full_name || user.email?.split('@')[0] || '',
              avatar_url: (user.user_metadata as any)?.avatar_url || null,
              email_verified: true,
              onboarding_completed: false
            }, { onConflict: 'id' })

          const { data: created } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (!created) {
            setError('Failed to initialize user profile')
            return
          }
          setUser(created)
        }

        if (userProfile) {
          setUser(userProfile)

          if (userProfile.onboarding_completed) {
            window.location.href = '/dashboard'
            return
          }

          if (userProfile.business_entity_type) {
            setBusinessEntityType(userProfile.business_entity_type)
            setStep(1)
          }

          setFormData({
            company_name: userProfile.company_name || '',
            phone: userProfile.phone || '',
            business_address: userProfile.business_address || '',
            business_type: userProfile.business_type || 'furniture_rental',
            legal_name: userProfile.legal_name || '',
            rfc: userProfile.rfc || '',
            legal_representative: userProfile.legal_representative || '',
            fiscal_address: userProfile.fiscal_address || '',
          })
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setError('Authentication error occurred')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const validateStep = () => {
    if (step === 0) {
      if (!businessEntityType) {
        setError('Por favor selecciona el tipo de entidad')
        return false
      }
    }

    if (step === 1) {
      if (!formData.company_name.trim()) {
        setError('Por favor ingresa el nombre de tu negocio')
        return false
      }
      if (businessEntityType === 'legal') {
        if (!formData.legal_name.trim()) {
          setError('Por favor ingresa la razón social')
          return false
        }
        if (!formData.rfc.trim()) {
          setError('Por favor ingresa el RFC')
          return false
        }
        if (formData.rfc.length < 12 || formData.rfc.length > 13) {
          setError('El RFC debe tener 12 o 13 caracteres')
          return false
        }
      }
    }

    if (step === 2) {
      if (formData.phone && (formData.phone.length < 10 || formData.phone.length > 20)) {
        setError('El teléfono debe tener entre 10 y 20 caracteres')
        return false
      }
    }

    if (step === 3) {
      if (!selectedPlan) {
        setError('Por favor selecciona un plan')
        return false
      }
    }

    return true
  }

  const handleEntitySelection = (type: 'legal' | 'local') => {
    setBusinessEntityType(type)
    setError('')
  }

  const nextStep = () => {
    if (validateStep()) {
      setError('')
      setStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    if (step === 1 && businessEntityType) {
      setStep(0)
      setBusinessEntityType(null)
    } else {
      setStep(prev => Math.max(prev - 1, 0))
    }
    setError('')
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validateStep()) return

    setSubmitLoading(true)
    setError('')

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        window.location.href = '/login'
        return
      }

      const updateData: any = {
        company_name: formData.company_name,
        business_type: formData.business_type,
        phone: formData.phone,
        business_address: formData.business_address,
        business_entity_type: businessEntityType,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }

      if (businessEntityType === 'legal') {
        updateData.legal_name = formData.legal_name
        updateData.rfc = formData.rfc.toUpperCase()
        updateData.legal_representative = formData.legal_representative
        updateData.fiscal_address = formData.fiscal_address
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (error) {
        throw new Error('Failed to update profile')
      }

      // Guardar el plan seleccionado en localStorage para procesarlo después
      if (selectedPlan) {
        setPendingCheckout({
          plan: selectedPlan,
          period: selectedPeriod
        })
      }

      // Redirigir al checkout de Stripe o dashboard
      if (selectedPlan && selectedPlan !== 'free') {
        // Crear sesión de checkout para planes de pago
        const checkoutResponse = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: selectedPlan,
            period: selectedPeriod,
          }),
        })

        if (checkoutResponse.ok) {
          const { url } = await checkoutResponse.json()
          if (url) {
            window.location.href = url
            return
          }
        }
      }

      // Si seleccionó plan Free o no hay checkout, ir directo al dashboard
      window.location.href = '/dashboard'

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ECF0F3' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ECF0F3' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Autenticación Requerida</h2>
          <p className="text-muted-foreground mb-4">Por favor inicia sesión para acceder a esta página.</p>
          <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium">Ir al Login</a>
        </div>
      </div>
    )
  }

  const totalSteps = businessEntityType ? 4 : 1
  const currentStepForProgress = step === 0 && businessEntityType ? 1 : step

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#ECF0F3' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              backgroundColor: '#ECF0F3',
              boxShadow: '9px 9px 16px #D1D9E6, -9px -9px 16px #FFFFFF'
            }}
          >
            <Sparkles className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            ¡Bienvenido a Evenza!
          </h1>
          <p className="text-lg text-muted-foreground">
            Configura tu cuenta en unos simples pasos
          </p>
        </div>

        {/* Progress Bar */}
        {step > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Progreso</span>
              <span className="text-sm font-medium text-muted-foreground">
                Paso {currentStepForProgress} de {totalSteps}
              </span>
            </div>
            <div
              className="w-full h-3 rounded-full"
              style={{
                backgroundColor: '#ECF0F3',
                boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
              }}
            >
              <div
                className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-600 to-purple-700"
                style={{ width: `${(currentStepForProgress / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card
          className="border-none"
          style={{
            backgroundColor: '#ECF0F3',
            boxShadow: '9px 9px 16px #D1D9E6, -9px -9px 16px #FFFFFF'
          }}
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-foreground">
              {step === 0 && '¿Qué tipo de entidad eres?'}
              {step === 1 && 'Información Básica'}
              {step === 2 && 'Datos de Contacto'}
              {step === 3 && 'Elige tu Plan'}
              {step === 4 && '¡Todo Listo!'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 0 && 'Selecciona la opción que mejor describa tu negocio'}
              {step === 1 && businessEntityType === 'legal' && 'Completa los datos legales de tu empresa'}
              {step === 1 && businessEntityType === 'local' && 'Cuéntanos sobre tu negocio'}
              {step === 2 && '¿Cómo podemos contactarte?'}
              {step === 3 && 'Selecciona el plan que mejor se adapte a tus necesidades'}
              {step === 4 && 'Revisa tu información y comienza a usar Evenza'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={(e) => { e.preventDefault(); step === 4 ? handleSubmit(e) : nextStep() }}>
              {/* Step 0: Entity Type Selection */}
              {step === 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Legal Entity Card */}
                  <div
                    onClick={() => handleEntitySelection('legal')}
                    className={`rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      businessEntityType === 'legal' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: businessEntityType === 'legal'
                        ? 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                        : '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
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
                        <Building2 className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Empresa Legal
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Soy una empresa formalmente constituida con RFC y razón social
                      </p>
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>RFC de empresa</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>Razón social</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>Contratos formales</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>Domicilio fiscal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Local Business Card */}
                  <div
                    onClick={() => handleEntitySelection('local')}
                    className={`rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                      businessEntityType === 'local' ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: businessEntityType === 'local'
                        ? 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                        : '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
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
                        <Store className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Negocio Local
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Soy un negocio independiente o emprendimiento local
                      </p>
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>Configuración simple</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>Solo datos básicos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>Términos informales</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-purple-600" />
                          <span>Inicio rápido</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {step === 1 && businessEntityType === 'legal' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre Comercial *</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      type="text"
                      placeholder="Ej: Renta de Muebles Mattu"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      className="border-none"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                      }}
                    />
                    <p className="text-xs text-muted-foreground">El nombre con el que te conocen tus clientes</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legal_name">Razón Social *</Label>
                    <Input
                      id="legal_name"
                      name="legal_name"
                      type="text"
                      placeholder="Ej: Muebles y Eventos Mattu S.A. de C.V."
                      value={formData.legal_name}
                      onChange={handleChange}
                      required
                      className="border-none"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Nombre legal registrado ante el SAT</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rfc">RFC de la Empresa *</Label>
                      <Input
                        id="rfc"
                        name="rfc"
                        type="text"
                        placeholder="Ej: ABC123456XYZ"
                        value={formData.rfc}
                        onChange={handleChange}
                        maxLength={13}
                        required
                        className="border-none uppercase"
                        style={{
                          backgroundColor: '#ECF0F3',
                          boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="legal_representative">Representante Legal</Label>
                      <Input
                        id="legal_representative"
                        name="legal_representative"
                        type="text"
                        placeholder="Nombre completo"
                        value={formData.legal_representative}
                        onChange={handleChange}
                        className="border-none"
                        style={{
                          backgroundColor: '#ECF0F3',
                          boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fiscal_address">Domicilio Fiscal</Label>
                    <Input
                      id="fiscal_address"
                      name="fiscal_address"
                      type="text"
                      placeholder="Calle, Número, Colonia, CP, Ciudad, Estado"
                      value={formData.fiscal_address}
                      onChange={handleChange}
                      className="border-none"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                      }}
                    />
                  </div>
                </div>
              )}

              {step === 1 && businessEntityType === 'local' && (
                <div className="space-y-5">
                  <div className="text-center mb-6">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                      }}
                    >
                      <Store className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-muted-foreground">
                      Solo necesitamos algunos datos básicos para comenzar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre de tu Negocio *</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      type="text"
                      placeholder="Ej: Renta de Muebles Mattu"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      className="border-none text-lg"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                      }}
                    />
                    <p className="text-xs text-muted-foreground">¿Cómo se llama tu negocio?</p>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center mb-6">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                      }}
                    >
                      <Phone className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-muted-foreground">
                      Información de contacto para tus clientes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+52 971 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-none"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Aparecerá en tus cotizaciones y contratos</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_address">
                      {businessEntityType === 'legal' ? 'Dirección del Negocio' : 'Dirección'}
                    </Label>
                    <Input
                      id="business_address"
                      name="business_address"
                      type="text"
                      placeholder="Calle, Número, Colonia, Ciudad, Estado"
                      value={formData.business_address}
                      onChange={handleChange}
                      className="border-none"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {businessEntityType === 'legal'
                        ? 'Dirección comercial o de operaciones'
                        : 'Dirección de tu negocio'}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Plan Selection */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                      }}
                    >
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-muted-foreground">
                      Elige el plan que mejor se adapte a tu negocio
                    </p>
                  </div>

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
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div
                      onClick={() => setSelectedPlan('free')}
                      className={`rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                        selectedPlan === 'free' ? 'ring-2 ring-purple-500' : ''
                      }`}
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: selectedPlan === 'free'
                          ? 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                          : '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
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
                          <Gift className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Free
                        </h3>
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-foreground">
                            $0
                          </span>
                          <span className="text-muted-foreground">
                            /siempre
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                          Perfecto para empezar y explorar
                        </p>
                        <div className="space-y-3 text-left">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-purple-600" />
                            <span>Funcionalidades básicas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-purple-600" />
                            <span>Acceso limitado</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-purple-600" />
                            <span>Soporte comunitario</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-xs italic">Más detalles próximamente...</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Standard Plan */}
                    <div
                      onClick={() => setSelectedPlan('standard')}
                      className={`rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                        selectedPlan === 'standard' ? 'ring-2 ring-purple-500' : ''
                      }`}
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: selectedPlan === 'standard'
                          ? 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                          : '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
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
                          <Zap className="h-8 w-8 text-purple-600" />
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
                      onClick={() => setSelectedPlan('professional')}
                      className={`rounded-xl p-6 cursor-pointer transition-all duration-200 relative ${
                        selectedPlan === 'professional' ? 'ring-2 ring-purple-500' : ''
                      }`}
                      style={{
                        backgroundColor: '#ECF0F3',
                        boxShadow: selectedPlan === 'professional'
                          ? 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                          : '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
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

                  <p className="text-center text-xs text-muted-foreground mt-6">
                    Todos los planes incluyen actualizaciones gratuitas y puedes cancelar en cualquier momento
                  </p>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="text-center mb-3">
                  </div>

                  <div
                    className="rounded-xl p-2 space-y-4"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                    }}
                  >
                    <div className="flex justify-between items-center py-3 border-b border-muted">
                      <span className="font-medium text-muted-foreground">Tipo de Entidad:</span>
                      <span className="text-foreground font-semibold flex items-center gap-2">
                        {businessEntityType === 'legal' ? (
                          <>
                            <Building2 className="h-4 w-4 text-purple-600" />
                            <span>Empresa Legal</span>
                          </>
                        ) : (
                          <>
                            <Store className="h-4 w-4 text-purple-600" />
                            <span>Negocio Local</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-muted">
                      <span className="font-medium text-muted-foreground">Nombre:</span>
                      <span className="text-foreground">{formData.company_name}</span>
                    </div>
                    {businessEntityType === 'legal' && (
                      <>
                        <div className="flex justify-between items-center py-3 border-b border-muted">
                          <span className="font-medium text-muted-foreground">Razón Social:</span>
                          <span className="text-foreground">{formData.legal_name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-muted">
                          <span className="font-medium text-muted-foreground">RFC:</span>
                          <span className="text-foreground font-mono">{formData.rfc.toUpperCase()}</span>
                        </div>
                        {formData.legal_representative && (
                          <div className="flex justify-between items-center py-3 border-b border-muted">
                            <span className="font-medium text-muted-foreground">Representante:</span>
                            <span className="text-foreground">{formData.legal_representative}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center py-3 border-b border-muted">
                      <span className="font-medium text-muted-foreground">Giro:</span>
                      <span className="text-foreground">
                        Renta de Muebles
                      </span>
                    </div>
                    {formData.phone && (
                      <div className="flex justify-between items-center py-3 border-b border-muted">
                        <span className="font-medium text-muted-foreground">Teléfono:</span>
                        <span className="text-foreground">{formData.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3">
                      <span className="font-medium text-muted-foreground">Plan Seleccionado:</span>
                      <span className="text-foreground font-semibold flex items-center gap-2">
                        {selectedPlan === 'free' && (
                          <>
                            <Gift className="h-4 w-4 text-purple-600" />
                            <span>Free (Gratis)</span>
                          </>
                        )}
                        {selectedPlan === 'standard' && (
                          <>
                            <Zap className="h-4 w-4 text-purple-600" />
                            <span>Starter ({selectedPeriod === 'monthly' ? 'Mensual' : 'Anual'})</span>
                          </>
                        )}
                        {selectedPlan === 'professional' && (
                          <>
                            <Crown className="h-4 w-4 text-purple-600" />
                            <span>Professional ({selectedPeriod === 'monthly' ? 'Mensual' : 'Anual'})</span>
                          </>
                        )}
                      </span>
                    </div>
                    {selectedPlan === 'professional' && (
                      <div className="bg-yellow-400 text-purple-700 text-sm font-bold px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2">
                        <Gift className="h-4 w-4" />
                        <span>Incluye 7 días de prueba gratis</span>
                      </div>
                    )}
                    {selectedPlan === 'free' && (
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2">
                        <span>Empieza gratis, actualiza cuando quieras</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 gap-4">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="px-6 border-none"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                )}

                {step === 0 && businessEntityType && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="px-6 ml-auto border-none text-purple-600"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                    }}
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {step > 0 && step < 4 && (
                  <Button
                    type="submit"
                    className="px-6 ml-auto border-none text-purple-600"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                    }}
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {step === 4 && (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="px-8 ml-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-none shadow-lg shadow-purple-500/30"
                  >
                    {submitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Comenzar a Usar Evenza
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Podrás actualizar esta información en cualquier momento desde la configuración de tu cuenta</p>
          <p className="mt-2">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:support@evenza.com" className="text-purple-600 hover:text-purple-700 font-medium">
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
