import { EmailService } from '@/lib/email-service'

/**
 * Servicio de notificaciones de autenticación usando Resend
 */
export class AuthNotificationService {
  
  /**
   * Enviar email de bienvenida después del registro
   */
  static async sendWelcomeNotification(email: string, userName?: string) {
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

      return { success: true, data: result.data }

    } catch (error) {
      console.error('Error crítico al enviar notificación de bienvenida:', error)
      return { error: 'Error interno al enviar notificación' }
    }
  }

  /**
   * Enviar email de verificación personalizado
   * ⚠️ NOTA: Este método usa supabase.auth.admin y solo debe llamarse desde el servidor
   * (API routes, server actions, o webhooks). No funcionará desde componentes del cliente.
   */
  static async sendVerificationNotification(_userId: string, _verificationUrl: string, _userName?: string) {
    // TODO: Este método necesita ser movido a server-side code o recibir el email directamente
    throw new Error('Este método solo puede ejecutarse del lado del servidor')

    /* try {
      // Obtener el email del usuario desde Supabase
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)
      
      if (userError || !user?.email) {
        console.error('Error al obtener usuario para enviar verificación:', userError)
        return { error: 'No se pudo obtener el email del usuario' }
      }

      // Enviar email de verificación
      const result = await EmailService.sendVerificationEmail(user.email, verificationUrl, userName)
      
      if (result.error) {
        console.error('Error al enviar email de verificación:', result.error)
        return { error: 'No se pudo enviar el email de verificación' }
      }

      console.log('✅ Email de verificación enviado exitosamente a:', user.email)
      return { success: true, data: result.data }

    } catch (error) {
      console.error('Error crítico al enviar notificación de verificación:', error)
      return { error: 'Error interno al enviar notificación' }
    } */
  }

  /**
   * Enviar email de restablecimiento de contraseña personalizado
   * ⚠️ NOTA: Este método usa supabase.auth.admin y solo debe llamarse desde el servidor
   * (API routes, server actions, o webhooks). No funcionará desde componentes del cliente.
   */
  static async sendPasswordResetNotification(_userId: string, _resetUrl: string, _userName?: string) {
    // TODO: Este método necesita ser movido a server-side code o recibir el email directamente
    throw new Error('Este método solo puede ejecutarse del lado del servidor')

    /* try {
      // Obtener el email del usuario desde Supabase
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)
      
      if (userError || !user?.email) {
        console.error('Error al obtener usuario para enviar restablecimiento:', userError)
        return { error: 'No se pudo obtener el email del usuario' }
      }

      // Enviar email de restablecimiento
      const result = await EmailService.sendPasswordResetEmail(user.email, resetUrl, userName)
      
      if (result.error) {
        console.error('Error al enviar email de restablecimiento:', result.error)
        return { error: 'No se pudo enviar el email de restablecimiento' }
      }

      console.log('✅ Email de restablecimiento enviado exitosamente a:', user.email)
      return { success: true, data: result.data }

    } catch (error) {
      console.error('Error crítico al enviar notificación de restablecimiento:', error)
      return { error: 'Error interno al enviar notificación' }
    } */
  }

  /**
   * Hook para ejecutar después del registro exitoso
   * Llama a esta función después de crear un usuario
   */
  static async onUserRegistered(email: string, userName?: string) {
    // Enviar email de bienvenida
    await this.sendWelcomeNotification(email, userName)

    // Aquí puedes agregar más notificaciones en el futuro:
    // - Notificación a Slack/Discord
    // - Actualización en CRM
    // - Analytics tracking
    // - etc.
  }

  /**
   * Hook para ejecutar después de la verificación de email
   */
  static async onEmailVerified(_userId: string, _userName?: string) {
    // Aquí puedes agregar lógica adicional cuando un usuario verifica su email
  }

  /**
   * Hook para ejecutar después de restablecer contraseña
   */
  static async onPasswordReset(_userId: string) {
    // Aquí puedes agregar notificaciones de seguridad
    // Password reset complete
  }
}