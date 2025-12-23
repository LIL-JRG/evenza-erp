## Plan para solucionar el flujo de ventas desde la landing page

### Problema actual:
Cuando un usuario no autenticado intenta comprar desde la landing page:
1. Se guarda el plan en `localStorage` como `pendingCheckout`
2. Se redirige a `/register?redirect=pricing&plan=PLAN_NAME`
3. Después de registrarse y completar onboarding, **el checkout pendiente se pierde** y el usuario termina en el dashboard sin poder completar la compra

### Solución propuesta:

#### 1. Crear función helper para manejar checkout pendiente
Crear una función `handlePendingCheckout()` que:
- Verifique si existe `pendingCheckout` en localStorage
- Extraiga el plan y período guardados
- Limpie el localStorage después de procesar
- Redirija al checkout de Stripe con el plan correspondiente

#### 2. Integrar en los puntos clave del flujo de autenticación

**A. En `/register` página (después de registro exitoso):**
- Antes de redirigir a onboarding, verificar si hay checkout pendiente
- Si existe, procesarlo en lugar de redirigir a onboarding

**B. En `/onboarding` página (después de completar onboarding):**
- Antes de redirigir a dashboard, verificar checkout pendiente
- Si existe, procesarlo

**C. En `/login` página (después de login exitoso):**
- Si el usuario tiene onboarding completo, verificar checkout pendiente
- Si existe, procesarlo en lugar de redirigir directamente a dashboard

**D. En `/api/auth/google/callback` (después de OAuth exitoso):**
- Similar al login, verificar checkout pendiente antes de redirigir

#### 3. Modificar el componente PricingSection
Actualizar la lógica de autenticación para que los usuarios autenticados puedan proceder directamente al checkout sin necesidad de guardar `pendingCheckout`

#### 4. Flujo resultante:
1. Usuario no autenticado → Landing page → Selecciona plan → Guarda checkout pendiente → Registro/Login
2. **NUEVO:** Después de autenticación completa → Sistema detecta checkout pendiente → Redirige directamente a Stripe checkout
3. **NUEVO:** Si no hay checkout pendiente → Flujo normal (dashboard/onboarding)

### Archivos a modificar:
- `/components/pricing-section.tsx` - Mejorar lógica de autenticación
- `/app/register/page.tsx` - Agregar verificación de checkout pendiente
- `/app/onboarding/page.tsx` - Agregar verificación antes de redirigir a dashboard
- `/app/login/page.tsx` - Agregar verificación de checkout pendiente
- `/app/api/auth/google/callback/route.ts` - Agregar verificación en OAuth callback

¿Deseas que proceda con esta implementación?