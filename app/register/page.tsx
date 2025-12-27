'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { handlePendingCheckoutOrFallback } from '@/lib/checkout-helper'
import { sendWelcomeEmail } from '@/app/auth/actions'
import { Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos requeridos')
      return false
    }

    if (formData.name.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un correo electrónico válido')
      return false
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }

    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasLowerCase = /[a-z]/.test(formData.password)
    const hasNumbers = /\d/.test(formData.password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (authData.user) {
        // Create user profile (sin company_name)
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          email_verified: false,
          onboarding_completed: false,
        })

        if (profileError) {
          throw new Error('Error al crear el perfil de usuario')
        }

        // Enviar email de bienvenida usando Server Action
        try {
          await sendWelcomeEmail(formData.email, formData.name)
        } catch (notificationError) {
          console.error('Error al enviar email de bienvenida:', notificationError)
          // No detenemos el flujo por error en notificación
        }
      }

      setSuccess(true)

      // Redirect to onboarding after successful registration
      setTimeout(async () => {
        await handlePendingCheckoutOrFallback(router, () => {
          router.push('/onboarding')
        })
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/auth/callback`
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      // The redirect will happen automatically
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Password strength indicators
  const hasMinLength = formData.password.length >= 8
  const hasUpperCase = /[A-Z]/.test(formData.password)
  const hasLowerCase = /[a-z]/.test(formData.password)
  const hasNumbers = /\d/.test(formData.password)

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#ECF0F3' }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <Image
              src="/evenza/logo_evenza_sf.png"
              alt="Evenza"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-foreground">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Main Card */}
        <Card
          className="border-none"
          style={{
            backgroundColor: '#ECF0F3',
            boxShadow: '9px 9px 16px #D1D9E6, -9px -9px 16px #FFFFFF'
          }}
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Registro</CardTitle>
            <CardDescription>
              Completa el formulario para crear tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    ¡Cuenta creada exitosamente! Redirigiendo al onboarding...
                  </AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading || success}
                    required
                    className="pl-10 border-none"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                    }}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading || success}
                    required
                    className="pl-10 border-none"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading || success}
                    required
                    className="pl-10 pr-10 border-none"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicators */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={hasMinLength ? 'text-green-600' : 'text-muted-foreground'}>
                        Mínimo 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}>
                        Una letra mayúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}>
                        Una letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${hasNumbers ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={hasNumbers ? 'text-green-600' : 'text-muted-foreground'}>
                        Un número
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading || success}
                    required
                    className="pl-10 pr-10 border-none"
                    style={{
                      backgroundColor: '#ECF0F3',
                      boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-6 border-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-muted-foreground" style={{ backgroundColor: '#ECF0F3' }}>
                    O continúa con
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-none"
                onClick={handleGoogleSignUp}
                disabled={loading || success}
                style={{
                  backgroundColor: '#ECF0F3',
                  boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          Al crear una cuenta, aceptas nuestros{' '}
          <Link href="/terms" className="underline hover:text-foreground transition-colors">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  )
}
