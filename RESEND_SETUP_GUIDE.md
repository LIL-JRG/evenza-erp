# Configuración de Resend con Supabase

## Paso 1: Obtener tu API Key de Resend

1. Ve a [https://resend.com](https://resend.com)
2. Regístrate o inicia sesión
3. Ve a "API Keys" en el menú
4. Crea una nueva API Key
5. Copia la clave (empieza con `re_`)

## Paso 2: Configurar el dominio en Resend

1. En el dashboard de Resend, ve a "Domains"
2. Agrega tu dominio (por ejemplo: `evenza.app`)
3. Sigue las instrucciones para verificar el dominio con registros DNS
4. Una vez verificado, podrás enviar emails desde ese dominio

## Paso 3: Actualizar las variables de entorno

Actualiza el archivo `.env` con tus credenciales reales de Resend:

```env
# Reemplaza con tu API key real de Resend
RESEND_API_KEY=re_tu_api_key_aqui

# Reemplaza con tu dominio verificado en Resend
RESEND_FROM_EMAIL=noreply@tudominio.com
RESEND_FROM_NAME=Tu Empresa

# SMTP Configuration for Supabase (using Resend)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_tu_api_key_aqui
```

## Paso 4: Configurar Supabase para usar Resend SMTP

1. Ve al dashboard de Supabase: [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a "Authentication" → "Providers"
4. Busca "SMTP" y habilítalo
5. Configura con estos valores:

   **SMTP Settings:**
   - **SMTP Host:** `smtp.resend.com`
   - **SMTP Port:** `587`
   - **SMTP User:** `resend`
   - **SMTP Pass:** Tu API key de Resend (re_tu_api_key_aqui)
   - **SMTP Admin Email:** Tu email de administrador
   - **SMTP Sender Name:** El nombre de tu empresa

6. Guarda los cambios

## Paso 5: Verificar la configuración

Puedes probar el envío de emails con este script de prueba:

```typescript
// Crear un archivo test-email.ts
import { EmailService } from '@/lib/email-service'

async function testEmail() {
  try {
    const result = await EmailService.sendWelcomeEmail('tu-email@ejemplo.com', 'Test User')
    
    if (result.error) {
      console.error('Error al enviar email:', result.error)
    } else {
      console.log('Email enviado exitosamente:', result.data)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

testEmail()
```

## Notas importantes:

1. **Dominio gratuito**: Puedes usar el dominio genérico de Resend (`@resend.dev`) para pruebas, pero tiene límites
2. **Dominio personalizado**: Para producción, necesitas verificar tu propio dominio
3. **Límites**: El plan gratuito de Resend tiene límites diarios
4. **DNS**: Para dominios personalizados, necesitarás configurar registros SPF, DKIM y DMARC

## Solución de problemas:

- **Error 403**: Verifica que tu API key sea correcta
- **Error de dominio**: Asegúrate de que el dominio esté verificado en Resend
- **Emails en spam**: Configura correctamente los registros DNS (SPF, DKIM, DMARC)

## Próximos pasos:

Una vez configurado Resend, podemos:
1. Personalizar los templates de email
2. Agregar más tipos de notificaciones
3. Implementar email transaccionales para el negocio
4. Configurar email marketing