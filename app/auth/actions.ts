'use server'

import { EmailService } from '@/lib/email-service'

/**
 * Server Action para enviar email de bienvenida
 * Este código se ejecuta en el servidor donde RESEND_API_KEY está disponible
 */
export async function sendWelcomeEmail(email: string, userName?: string) {
  try {
    if (!email) {
      console.error('Email no proporcionado para enviar bienvenida')
      return { error: 'Email no proporcionado' }
    }

    // Enviar email de bienvenida
    const result = await EmailService.sendWelcomeEmail(email, userName)

    if (result.error) {
      console.error('Error al enviar email de bienvenida:', result.error)
      return { error: 'No se pudo enviar el email de bienvenida' }
    }

    console.log('✅ Email de bienvenida enviado exitosamente a:', email)
    return { success: true, data: result.data }

  } catch (error) {
    console.error('Error crítico al enviar notificación de bienvenida:', error)
    return { error: 'Error interno al enviar notificación' }
  }
}

/**
 * Server Action para enviar email de verificación
 */
export async function sendVerificationEmail(email: string, verificationUrl: string, userName?: string) {
  try {
    if (!email || !verificationUrl) {
      return { error: 'Email y URL de verificación son requeridos' }
    }

    const result = await EmailService.sendVerificationEmail(email, verificationUrl, userName)

    if (result.error) {
      console.error('Error al enviar email de verificación:', result.error)
      return { error: 'No se pudo enviar el email de verificación' }
    }

    console.log('✅ Email de verificación enviado exitosamente a:', email)
    return { success: true, data: result.data }

  } catch (error) {
    console.error('Error crítico al enviar email de verificación:', error)
    return { error: 'Error interno al enviar notificación' }
  }
}

/**
 * Server Action para enviar email de restablecimiento de contraseña
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string) {
  try {
    if (!email || !resetUrl) {
      return { error: 'Email y URL de restablecimiento son requeridos' }
    }

    const result = await EmailService.sendPasswordResetEmail(email, resetUrl, userName)

    if (result.error) {
      console.error('Error al enviar email de restablecimiento:', result.error)
      return { error: 'No se pudo enviar el email de restablecimiento' }
    }

    console.log('✅ Email de restablecimiento enviado exitosamente a:', email)
    return { success: true, data: result.data }

  } catch (error) {
    console.error('Error crítico al enviar email de restablecimiento:', error)
    return { error: 'Error interno al enviar notificación' }
  }
}
