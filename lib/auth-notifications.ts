import { EmailService } from '@/lib/email-service'
import { supabase } from '@/lib/supabase-auth'

/**
 * Servicio de notificaciones de autenticación usando Resend
 */
export class AuthNotificationService {
  
  /**
   * Enviar email de bienvenida después del registro
   */
  static async sendWelcomeNotification(userId: string, userName?: string) {
    try {
      // Obtener el email del usuario desde Supabase
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)
      
      if (userError || !user?.email) {
        console.error('Error al obtener usuario para enviar bienvenida:', userError)
        return { error: 'No se pudo obtener el email del usuario' }
      }

      // Enviar email de bienvenida
      const result = await EmailService.sendWelcomeEmail(user.email, userName)
      
      if (result.error) {
        console.error('Error al enviar email de bienvenida:', result.error)
        return { error: 'No se pudo enviar el email de bienvenida' }
      }

      console.log('✅ Email de bienvenida enviado exitosamente a:', user.email)
      return { success: true, data: result.data }
      
    } catch (error) {
      console.error('Error crítico al enviar notificación de bienvenida:', error)
      return { error: 'Error interno al enviar notificación' }
    }
  }

  /**
   * Enviar email de verificación personalizado
   */
  static async sendVerificationNotification(userId: string, verificationUrl: string, userName?: string) {
    try {
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
    }
  }

  /**
   * Enviar email de restablecimiento de contraseña personalizado
   */
  static async sendPasswordResetNotification(userId: string, resetUrl: string, userName?: string) {
    try {
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
    }
  }

  /**
   * Hook para ejecutar después del registro exitoso
   * Llama a esta función después de crear un usuario
   */
  static async onUserRegistered(userId: string, userName?: string) {
    // Enviar email de bienvenida
    await this.sendWelcomeNotification(userId, userName)
    
    // Aquí puedes agregar más notificaciones en el futuro:
    // - Notificación a Slack/Discord
    // - Actualización en CRM
    // - Analytics tracking
    // - etc.
  }

  /**
   * Hook para ejecutar después de la verificación de email
   */
  static async onEmailVerified(userId: string, userName?: string) {
    // Aquí puedes agregar lógica adicional cuando un usuario verifica su email
    console.log(`✅ Email verificado para usuario: ${userId}`)
  }

  /**
   * Hook para ejecutar después de restablecer contraseña
   */
  static async onPasswordReset(userId: string) {
    // Aquí puedes agregar notificaciones de seguridad
    console.log(`🔒 Contraseña restablecida para usuario: ${userId}`)
  }
}