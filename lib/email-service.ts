import { Resend } from 'resend'

// Inicializar cliente de Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Configuración por defecto
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'noreply@evenza.app'
const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || 'Evenza ERP'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  fromName?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  tags?: Array<{ name: string; value: string }>
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

/**
 * Servicio de email usando Resend
 */
export class EmailService {
  /**
   * Enviar email simple
   */
  static async sendEmail(options: EmailOptions): Promise<{ data?: any; error?: any }> {
    try {
      const from = options.from || `${options.fromName || DEFAULT_FROM_NAME} <${DEFAULT_FROM}>`
      
      const result = await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        tags: options.tags,
      })

      return { data: result }
    } catch (error) {
      console.error('Error al enviar email:', error)
      return { error }
    }
  }

  /**
   * Enviar email de verificación
   */
  static async sendVerificationEmail(email: string, verificationUrl: string, userName?: string): Promise<{ data?: any; error?: any }> {
    const template = this.getVerificationTemplate(verificationUrl, userName)
    
    return this.sendEmail({
      to: email,
      subject: 'Verifica tu cuenta - Evenza ERP',
      html: template.html,
      text: template.text,
      tags: [{ name: 'type', value: 'verification' }],
    })
  }

  /**
   * Enviar email de restablecimiento de contraseña
   */
  static async sendPasswordResetEmail(email: string, resetUrl: string, userName?: string): Promise<{ data?: any; error?: any }> {
    const template = this.getPasswordResetTemplate(resetUrl, userName)
    
    return this.sendEmail({
      to: email,
      subject: 'Restablece tu contraseña - Evenza ERP',
      html: template.html,
      text: template.text,
      tags: [{ name: 'type', value: 'password-reset' }],
    })
  }

  /**
   * Enviar email de bienvenida
   */
  static async sendWelcomeEmail(email: string, userName?: string): Promise<{ data?: any; error?: any }> {
    const template = this.getWelcomeTemplate(userName)
    
    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido a Evenza ERP!',
      html: template.html,
      text: template.text,
      tags: [{ name: 'type', value: 'welcome' }],
    })
  }

  /**
   * Obtener template de verificación
   */
  private static getVerificationTemplate(verificationUrl: string, userName?: string): EmailTemplate {
    const greeting = userName ? `Hola ${userName}` : 'Hola'
    
    return {
      subject: 'Verifica tu cuenta - Evenza ERP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica tu cuenta - Evenza ERP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Evenza ERP</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Gestión integral para agencias de renta de muebles</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #4a5568; margin-bottom: 20px;">${greeting},</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ¡Gracias por registrarte en Evenza ERP! Para completar tu registro y asegurar la seguridad de tu cuenta, necesitamos verificar tu dirección de email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Verificar mi cuenta
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">
              Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:
            </p>
            
            <p style="background: #f7fafc; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; word-break: break-all; color: #4a5568;">
              ${verificationUrl}
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                ¿No creaste esta cuenta? Puedes ignorar este email de forma segura.
              </p>
              <p style="color: #718096; font-size: 14px; margin: 10px 0 0 0;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px;">
            <p>Este email fue enviado por Evenza ERP</p>
            <p>© 2024 Evenza. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `,
      text: `
${greeting},

¡Gracias por registrarte en Evenza ERP! Para completar tu registro y asegurar la seguridad de tu cuenta, necesitamos verificar tu dirección de email.

Por favor, visita el siguiente enlace para verificar tu cuenta:
${verificationUrl}

¿No creaste esta cuenta? Puedes ignorar este email de forma segura.

Si tienes alguna pregunta, no dudes en contactarnos.

--
Evenza ERP
© 2024 Evenza. Todos los derechos reservados.
      `
    }
  }

  /**
   * Obtener template de restablecimiento de contraseña
   */
  private static getPasswordResetTemplate(resetUrl: string, userName?: string): EmailTemplate {
    const greeting = userName ? `Hola ${userName}` : 'Hola'
    
    return {
      subject: 'Restablece tu contraseña - Evenza ERP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablece tu contraseña - Evenza ERP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Evenza ERP</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Gestión integral para agencias de renta de muebles</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #4a5568; margin-bottom: 20px;">${greeting},</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Evenza ERP. Si no hiciste esta solicitud, puedes ignorar este email de forma segura.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Restablecer mi contraseña
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">
              Este enlace expirará en 1 hora por seguridad. Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:
            </p>
            
            <p style="background: #f7fafc; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; word-break: break-all; color: #4a5568;">
              ${resetUrl}
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                ¿No solicitaste este restablecimiento? Tu cuenta está segura, solo ignora este email.
              </p>
              <p style="color: #718096; font-size: 14px; margin: 10px 0 0 0;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px;">
            <p>Este email fue enviado por Evenza ERP</p>
            <p>© 2024 Evenza. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `,
      text: `
${greeting},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Evenza ERP. Si no hiciste esta solicitud, puedes ignorar este email de forma segura.

Por favor, visita el siguiente enlace para restablecer tu contraseña:
${resetUrl}

Este enlace expirará en 1 hora por seguridad.

¿No solicitaste este restablecimiento? Tu cuenta está segura, solo ignora este email.

Si tienes alguna pregunta, no dudes en contactarnos.

--
Evenza ERP
© 2024 Evenza. Todos los derechos reservados.
      `
    }
  }

  /**
   * Obtener template de bienvenida
   */
  private static getWelcomeTemplate(userName?: string): EmailTemplate {
    const greeting = userName ? `¡Bienvenido ${userName}!` : '¡Bienvenido!'
    
    return {
      subject: '¡Bienvenido a Evenza ERP!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Bienvenido a Evenza ERP!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Evenza ERP</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Gestión integral para agencias de renta de muebles</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #4a5568; margin-bottom: 20px;">${greeting}</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ¡Estamos emocionados de tenerte en Evenza ERP! Tu cuenta ha sido verificada exitosamente y ahora tienes acceso completo a todas nuestras funcionalidades diseñadas para agencias de renta de muebles.
            </p>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #4a5568; margin-top: 0;">¿Qué puedes hacer ahora?</h3>
              <ul style="color: #4a5568; margin: 10px 0; padding-left: 20px;">
                <li>Gestionar tus clientes y eventos</li>
                <li>Crear cotizaciones profesionales</li>
                <li>Administrar tu inventario de muebles</li>
                <li>Calendario de eventos integrado</li>
                <li>Chatbot IA para asistencia</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Ir a mi Dashboard
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">
              Si tienes alguna pregunta o necesitas ayuda para comenzar, no dudes en contactar a nuestro equipo de soporte. Estamos aquí para ayudarte a aprovechar al máximo Evenza ERP.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                ¡Gracias por unirte a nosotros!
              </p>
              <p style="color: #718096; font-size: 14px; margin: 10px 0 0 0;">
                El equipo de Evenza ERP
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px;">
            <p>Evenza ERP</p>
            <p>© 2024 Evenza. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `,
      text: `
${greeting}

¡Estamos emocionados de tenerte en Evenza ERP! Tu cuenta ha sido verificada exitosamente y ahora tienes acceso completo a todas nuestras funcionalidades diseñadas para agencias de renta de muebles.

¿Qué puedes hacer ahora?
• Gestionar tus clientes y eventos
• Crear cotizaciones profesionales  
• Administra tu inventario de muebles
• Calendario de eventos integrado
• Chatbot IA para asistencia

Accede a tu dashboard aquí: ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard

Si tienes alguna pregunta o necesitas ayuda para comenzar, no dudes en contactar a nuestro equipo de soporte. Estamos aquí para ayudarte a aprovechar al máximo Evenza ERP.

¡Gracias por unirte a nosotros!
El equipo de Evenza ERP

--
Evenza ERP
© 2024 Evenza. Todos los derechos reservados.
      `
    }
  }
}