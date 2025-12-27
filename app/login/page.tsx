'use client'

import { useState, useEffect } from 'react'
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
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (user) {
          // User is authenticated, check their profile
          const { data: profile, error: profileErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileErr || !profile) {
            // Create profile if it doesn't exist
            const { error: createError } = await supabase.from('users').upsert({
              id: user.id,
              email: user.email,
              name: (user.user_metadata as any)?.full_name || user.email?.split('@')[0] || '',
              avatar_url: (user.user_metadata as any)?.avatar_url || null,
              email_verified: true,
              onboarding_completed: false
            }, { onConflict: 'id' })

            if (!createError) {
              // Redirect to onboarding for new users
              window.location.href = '/onboarding'
              return
            }
          } else {
            // Profile exists, check onboarding status
            if (profile.onboarding_completed) {
              // Verificar checkout pendiente antes de ir al dashboard
              await handlePendingCheckoutOrFallback(router, () => {
                window.location.href = '/dashboard'
              })
              return
            } else {
              window.location.href = '/onboarding'
              return
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuthAndRedirect()
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ECF0F3' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

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
            Inicia sesión
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
              Regístrate
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
            <CardTitle className="text-2xl">Acceder</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6">
            <form onSubmit={handleEmailLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-6 border-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
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
                onClick={handleGoogleLogin}
                disabled={loading}
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

        {/* Help Text */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          <p>
            ¿Problemas para iniciar sesión?{' '}
            <a href="mailto:support@evenza.com" className="underline hover:text-foreground transition-colors">
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
