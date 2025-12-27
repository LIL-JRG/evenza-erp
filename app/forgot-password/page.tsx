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
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw new Error(error.message)
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
            Restablecer contraseña
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿Recordaste tu contraseña?{' '}
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
            <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Si existe una cuenta con este correo, hemos enviado un enlace de recuperación. Por favor revisa tu bandeja de entrada.
                  </AlertDescription>
                </Alert>
              )}

              {!success && (
                <>
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="pl-10 border-none"
                        style={{
                          backgroundColor: '#ECF0F3',
                          boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
                        }}
                      />
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
                        Enviando enlace...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar enlace de recuperación
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Back to Login */}
              <Link href="/login">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-none"
                  style={{
                    backgroundColor: '#ECF0F3',
                    boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          <p>
            Si no recibes el correo, revisa tu carpeta de spam o{' '}
            <a href="mailto:support@evenza.com" className="underline hover:text-foreground transition-colors">
              contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
