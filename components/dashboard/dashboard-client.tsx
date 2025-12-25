'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { handlePendingCheckoutOrFallback } from '@/lib/checkout-helper'

interface DashboardClientProps {
  userName: string
}

export default function DashboardClient({ userName }: DashboardClientProps) {
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un checkout pendiente al cargar el dashboard
    const processPendingCheckout = async () => {
      await handlePendingCheckoutOrFallback(router, () => {
        // No hay checkout pendiente, continuar normalmente
      })
    }

    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search)
    const checkoutPending = urlParams.get('checkout_pending')

    if (checkoutPending) {
      // Si viene del OAuth callback con checkout pendiente, procesarlo
      processPendingCheckout()
    }
  }, [router])

  return null
}