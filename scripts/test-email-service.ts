import { EmailService } from '@/lib/email-service'

/**
 * Script de prueba para verificar el funcionamiento de Resend
 * Este script debe ejecutarse después de configurar tu API key de Resend
 */

async function testEmailService() {
  console.log('🧪 Iniciando prueba de servicio de email...')
  
  // Verificar que la API key esté configurada
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    console.error('❌ Error: La API key de Resend no está configurada correctamente.')
    console.log('Por favor:')
    console.log('1. Obtén tu API key de https://resend.com/api-keys')
    console.log('2. Actualiza la variable RESEND_API_KEY en tu archivo .env')
    console.log('3. Reinicia tu servidor de desarrollo')
    return
  }

  // Verificar que el email de origen esté configurado
  if (!process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL === 'noreply@evenza.app') {
    console.warn('⚠️  Advertencia: El email de origen no está configurado correctamente.')
    console.log('Para pruebas, puedes usar un email @resend.dev o configurar tu dominio en https://resend.com/domains')
  }

  try {
    // Test 1: Email de bienvenida
    console.log('📧 Test 1: Enviando email de bienvenida...')
    const welcomeResult = await EmailService.sendWelcomeEmail(
      'test@example.com', // Reemplaza con tu email de prueba
      'Usuario de Prueba'
    )
    
    if (welcomeResult.error) {
      console.error('❌ Error en email de bienvenida:', welcomeResult.error)
    } else {
      console.log('✅ Email de bienvenida enviado exitosamente:', welcomeResult.data)
    }

    // Test 2: Email de verificación
    console.log('📧 Test 2: Enviando email de verificación...')
    const verificationResult = await EmailService.sendVerificationEmail(
      'test@example.com', // Reemplaza con tu email de prueba
      'https://tusitio.com/verify?token=test-token',
      'Usuario de Prueba'
    )
    
    if (verificationResult.error) {
      console.error('❌ Error en email de verificación:', verificationResult.error)
    } else {
      console.log('✅ Email de verificación enviado exitosamente:', verificationResult.data)
    }

    // Test 3: Email de restablecimiento de contraseña
    console.log('📧 Test 3: Enviando email de restablecimiento...')
    const resetResult = await EmailService.sendPasswordResetEmail(
      'test@example.com', // Reemplaza con tu email de prueba
      'https://tusitio.com/reset-password?token=test-token',
      'Usuario de Prueba'
    )
    
    if (resetResult.error) {
      console.error('❌ Error en email de restablecimiento:', resetResult.error)
    } else {
      console.log('✅ Email de restablecimiento enviado exitosamente:', resetResult.data)
    }

    console.log('\n🎉 ¡Pruebas completadas!')
    console.log('Revisa tu bandeja de entrada (y la carpeta de spam) para ver los emails de prueba.')
    
  } catch (error) {
    console.error('💥 Error crítico durante las pruebas:', error)
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  testEmailService()
}

export { testEmailService }