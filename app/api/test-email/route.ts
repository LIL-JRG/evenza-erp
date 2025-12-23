import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, type, userName, verificationUrl, resetUrl } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(email, userName)
        break
      
      case 'verification':
        if (!verificationUrl) {
          return NextResponse.json(
            { error: 'La URL de verificación es requerida' },
            { status: 400 }
          )
        }
        result = await EmailService.sendVerificationEmail(email, verificationUrl, userName)
        break
      
      case 'password-reset':
        if (!resetUrl) {
          return NextResponse.json(
            { error: 'La URL de restablecimiento es requerida' },
            { status: 400 }
          )
        }
        result = await EmailService.sendPasswordResetEmail(email, resetUrl, userName)
        break
      
      default:
        return NextResponse.json(
          { error: 'Tipo de email no válido. Use: welcome, verification, o password-reset' },
          { status: 400 }
        )
    }

    if (result.error) {
      console.error('Error al enviar email:', result.error)
      return NextResponse.json(
        { error: 'Error al enviar email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Email ${type} enviado exitosamente`,
      data: result.data
    })

  } catch (error) {
    console.error('Error en la API de email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint GET para verificar el estado del servicio
export async function GET() {
  try {
    // Verificar que la API key esté configurada
    const hasApiKey = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const hasFromEmail = !!process.env.RESEND_FROM_EMAIL && process.env.RESEND_FROM_EMAIL !== 'noreply@evenza.app'

    return NextResponse.json({
      status: 'ok',
      configured: hasApiKey && hasFromEmail,
      apiKey: hasApiKey ? '✅ Configurada' : '❌ No configurada',
      fromEmail: hasFromEmail ? '✅ Configurado' : '❌ No configurado',
      message: hasApiKey && hasFromEmail 
        ? 'El servicio de email está listo para usar'
        : 'Necesitas configurar las variables de entorno para usar el servicio de email'
    })

  } catch (error) {
    console.error('Error verificando estado del servicio:', error)
    return NextResponse.json(
      { error: 'Error al verificar el estado del servicio' },
      { status: 500 }
    )
  }
}