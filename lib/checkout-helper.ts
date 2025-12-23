export interface PendingCheckout {
  plan: string
  period: 'monthly' | 'annually'
}

/**
 * Verifica si existe un checkout pendiente en localStorage
 * @returns El checkout pendiente o null si no existe
 */
export function getPendingCheckout(): PendingCheckout | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('pendingCheckout')
    if (!stored) return null
    
    const checkout = JSON.parse(stored) as PendingCheckout
    
    // Validar que tenga la estructura correcta
    if (!checkout.plan || !checkout.period) return null
    
    return checkout
  } catch (error) {
    console.error('Error al obtener checkout pendiente:', error)
    return null
  }
}

/**
 * Guarda un checkout pendiente en localStorage
 * @param checkout - Los datos del checkout a guardar
 */
export function setPendingCheckout(checkout: PendingCheckout): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('pendingCheckout', JSON.stringify(checkout))
  } catch (error) {
    console.error('Error al guardar checkout pendiente:', error)
  }
}

/**
 * Elimina el checkout pendiente de localStorage
 */
export function clearPendingCheckout(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('pendingCheckout')
  } catch (error) {
    console.error('Error al limpiar checkout pendiente:', error)
  }
}

/**
 * Procesa el checkout pendiente y redirige al checkout de Stripe
 * @param router - El router de Next.js para la redirección
 * @returns true si se procesó correctamente, false si no había checkout pendiente
 */
export async function processPendingCheckout(router: any): Promise<boolean> {
  const pendingCheckout = getPendingCheckout()
  
  if (!pendingCheckout) {
    return false
  }
  
  try {
    // Limpiar el checkout pendiente inmediatamente para evitar loops
    clearPendingCheckout()
    
    // Realizar el checkout con el plan guardado
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: pendingCheckout.plan,
        period: pendingCheckout.period,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Error al crear sesión de checkout')
    }
    
    const { url } = await response.json()
    
    if (url) {
      // Redirigir a Stripe Checkout
      window.location.href = url
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error al procesar checkout pendiente:', error)
    return false
  }
}

/**
 * Verifica y procesa el checkout pendiente si existe
 * Si no hay checkout pendiente, ejecuta la función de fallback
 * @param router - El router de Next.js
 * @param fallback - Función a ejecutar si no hay checkout pendiente
 */
export async function handlePendingCheckoutOrFallback(
  router: any,
  fallback: () => void | Promise<void>
): Promise<void> {
  const processed = await processPendingCheckout(router)
  
  if (!processed) {
    // Si no se procesó un checkout pendiente, ejecutar el fallback
    await fallback()
  }
}