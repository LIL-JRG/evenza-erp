'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { handlePendingCheckoutOrFallback } from '@/lib/checkout-helper'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    business_size: '',
    years_in_business: '',
    phone: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          window.location.href = '/login'
          return
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !userProfile) {
          await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              name: (session.user.user_metadata as any)?.full_name || session.user.email?.split('@')[0] || '',
              avatar_url: (session.user.user_metadata as any)?.avatar_url || null,
              email_verified: true,
              onboarding_completed: false
            }, { onConflict: 'id' })

          const { data: created } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
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

          setFormData({
            company_name: userProfile.company_name || '',
            business_type: userProfile.business_type || '',
            business_size: userProfile.business_size || '',
            years_in_business: userProfile.years_in_business?.toString() || '',
            phone: userProfile.phone || ''
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
    if (step === 1) {
      if (!formData.company_name.trim()) {
        setError('Por favor ingresa el nombre de tu empresa')
        return false
      }
      if (formData.company_name.length < 2 || formData.company_name.length > 100) {
        setError('El nombre de la empresa debe tener entre 2 y 100 caracteres')
        return false
      }
    }
    
    if (step === 2) {
      if (!formData.business_type) {
        setError('Por favor selecciona el tipo de negocio')
        return false
      }
      if (!formData.business_size) {
        setError('Por favor selecciona el tamaño de tu negocio')
        return false
      }
    }

    if (step === 3) {
      if (formData.phone && (formData.phone.length < 10 || formData.phone.length > 20)) {
        setError('El teléfono debe tener entre 10 y 20 caracteres')
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setError('')
      setStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) return

    setSubmitLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/login'
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          company_name: formData.company_name,
          business_type: formData.business_type,
          business_size: formData.business_size,
          years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null,
          phone: formData.phone,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (error) {
        throw new Error('Failed to update profile')
      }

      // Procesar checkout pendiente o ir al dashboard
      await handlePendingCheckoutOrFallback(router, () => {
        window.location.href = '/dashboard'
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Autenticación Requerida</h2>
          <p className="text-gray-600 mb-4">Por favor inicia sesión para acceder a esta página.</p>
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">Ir al Login</a>
        </div>
      </div>
    )
  }

  const businessTypes = [
    { value: 'furniture_rental', label: 'Renta de Muebles' },
    { value: 'event_planning', label: 'Planeación de Eventos' },
    { value: 'party_rental', label: 'Renta de Equipo para Fiestas' },
    { value: 'wedding_services', label: 'Servicios de Bodas' },
    { value: 'corporate_events', label: 'Eventos Corporativos' },
    { value: 'other', label: 'Otro' }
  ]

  const businessSizes = [
    { value: 'solo', label: 'Solo yo' },
    { value: 'small', label: '2-5 empleados' },
    { value: 'medium', label: '6-20 empleados' },
    { value: 'large', label: 'Más de 20 empleados' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-2xl text-white">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a Evenza!
          </h1>
          <p className="text-lg text-gray-600">
            Cuéntanos sobre tu negocio para personalizar tu experiencia
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm font-medium text-gray-700">{step} de 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepNumber ? '✓' : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">
              {step === 1 && 'Nombre de tu Negocio'}
              {step === 2 && 'Información del Negocio'}
              {step === 3 && 'Datos de Contacto'}
              {step === 4 && '¡Listo para Comenzar!'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {step === 1 && 'Comencemos con lo básico'}
              {step === 2 && 'Cuéntanos más sobre tu empresa'}
              {step === 3 && '¿Cómo podemos contactarte?'}
              {step === 4 && 'Revisa tu información y comencemos'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Company Name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏢</div>
                    <p className="text-gray-600">
                      ¿Cuál es el nombre oficial de tu empresa de renta de muebles?
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      type="text"
                      placeholder="Ej: Renta de Muebles Mattu"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="text-lg"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Business Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="text-gray-600">
                      Ayúdanos a entender mejor tu negocio
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_type">Tipo de Negocio *</Label>
                      <select
                        id="business_type"
                        name="business_type"
                        value={formData.business_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecciona el tipo de negocio</option>
                        {businessTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_size">Tamaño del Negocio *</Label>
                      <select
                        id="business_size"
                        name="business_size"
                        value={formData.business_size}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecciona el tamaño</option>
                        {businessSizes.map(size => (
                          <option key={size.value} value={size.value}>
                            {size.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_in_business">Años en el Negocio</Label>
                      <Input
                        id="years_in_business"
                        name="years_in_business"
                        type="number"
                        placeholder="Ej: 5"
                        value={formData.years_in_business}
                        onChange={handleChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">📞</div>
                    <p className="text-gray-600">
                      ¿Cómo podemos contactarte para soporte y actualizaciones?
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono de Contacto</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+52 971 123 4567"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10"
                      />
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-1">📱</span>
                        Opcional, pero recomendado para soporte
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-gray-600">
                      ¡Excelente! Revisa tu información antes de continuar
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Empresa:</span>
                      <span className="text-gray-900">{formData.company_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <span className="text-gray-900">
                        {businessTypes.find(t => t.value === formData.business_type)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-700">Tamaño:</span>
                      <span className="text-gray-900">
                        {businessSizes.find(s => s.value === formData.business_size)?.label}
                      </span>
                    </div>
                    {formData.years_in_business && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Años:</span>
                        <span className="text-gray-900">{formData.years_in_business} años</span>
                      </div>
                    )}
                    {formData.phone && (
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-gray-700">Teléfono:</span>
                        <span className="text-gray-900">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button 
                type="button"
                variant="outline" 
                onClick={prevStep}
                className="px-6"
              >
                Anterior
              </Button>
            )}
            
            {step < 4 ? (
              <Button 
                type="button"
                onClick={nextStep}
                className="px-6 ml-auto"
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-6 ml-auto bg-green-600 hover:bg-green-700"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  'Comenzar'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500 mt-6">
          <p>Puedes actualizar esta información más tarde en la configuración de tu cuenta</p>
          <p className="mt-2">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:support@evenza.com" className="text-blue-600 hover:text-blue-800">
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
