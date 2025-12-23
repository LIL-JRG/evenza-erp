"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { setPendingCheckout } from "@/lib/checkout-helper"

// Force rebuild
export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")
  const [loading, setLoading] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  const handleCheckout = async (plan: string) => {
    try {
      setLoading(plan)

      // Validación: Verificar si el usuario está autenticado
      if (!isAuthenticated) {
        // Guardar el plan seleccionado en localStorage para redirigir después del login
        setPendingCheckout({ plan, period: billingPeriod })
        // Redirigir a registro con mensaje
        router.push('/register?redirect=pricing&plan=' + plan)
        return
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, period: billingPeriod }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || "Network response was not ok")
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error("Error:", err)
      alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.")
    } finally {
      setLoading(null)
    }
  }

  const pricing = {
    standard: {
      monthly: 199,
      annually: 1990,
    },
    professional: {
      monthly: 349,
      annually: 3499,
    },
    enterprise: {
      monthly: 299,
      annually: 2990,
    },
  }

  return (
    <div className="w-full flex justify-center items-start">
      <div className="flex-1 px-4 md:px-12 py-16 md:py-20 flex flex-col justify-start items-start gap-12">
        {/* Header */}
        <div className="w-full flex flex-col justify-center items-start gap-4">
          <div className="text-gray-900 font-semibold leading-tight md:leading-[44px] font-sans text-4xl tracking-tight">
            Planes transparentes para cualquier tamaño de agencia
          </div>
          <div className="text-gray-600 text-base font-normal leading-7 font-sans">
            Comienza gratis y escala conforme creces. Sin sorpresas.
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingPeriod === "monthly" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod("annually")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingPeriod === "annually" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            Anual (Ahorra 10%)
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Starter Plan */}
          <div className="flex-1 px-6 py-5 border border-purple-200 bg-white rounded-lg flex flex-col gap-8 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-gray-900 text-lg font-medium mb-2">Starter</h3>
                <p className="text-gray-600 text-sm">Para agencias pequeñas que comienzan.</p>
              </div>
              <div>
                <div className="text-5xl font-semibold text-purple-700 mb-1">
                  ${billingPeriod === "monthly" ? pricing.standard.monthly : Math.floor(pricing.standard.annually / 12)}
                  /mes
                </div>
                <p className="text-sm text-gray-600">
                  por usuario, facturado {billingPeriod === "monthly" ? "mensualmente" : "anualmente"}
                </p>
              </div>
              <button
                onClick={() => handleCheckout("standard")}
                disabled={loading === "standard"}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 transition-all duration-300"
              >
                {loading === "standard" ? "Procesando..." : "Comenzar gratis"}
              </button>
            </div>
            <div className="flex flex-col gap-3 border-t border-purple-200 pt-6">
              {["Hasta 50 clientes", "Calendario básico", "Cotizaciones estándar", "Soporte por email"].map(
                (feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="#9333ea"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Professional Plan (Featured) */}
          <div className="flex-1 px-6 py-5 bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-600 rounded-lg flex flex-col gap-8 relative hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 scale-105">
            <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full">
              <span className="text-purple-700 text-xs font-semibold">POPULAR</span>
            </div>
            <div className="absolute -top-3 right-6 bg-yellow-400 px-3 py-1 rounded-full">
              <span className="text-purple-700 text-xs font-bold">14 DÍAS GRATIS</span>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">Professional</h3>
                <p className="text-purple-200 text-sm">Para agencias en crecimiento. {billingPeriod === "monthly" ? "¡14 días de prueba gratis!" : "¡14 días de prueba gratis!"}</p>
              </div>
              <div>
                <div className="text-5xl font-semibold text-white mb-1">
                  $
                  {billingPeriod === "monthly"
                    ? pricing.professional.monthly
                    : Math.floor(pricing.professional.annually / 12)}
                  /mes
                </div>
                <p className="text-sm text-purple-200">
                  por usuario, facturado {billingPeriod === "monthly" ? "mensualmente" : "anualmente"}
                </p>
              </div>
              <button
                onClick={() => handleCheckout("professional")}
                disabled={loading === "professional"}
                className="w-full px-4 py-2 bg-white text-purple-700 rounded-full font-medium hover:bg-purple-50 hover:shadow-lg disabled:opacity-50 transition-all duration-300"
              >
                {loading === "professional" ? "Procesando..." : "Comenzar gratis"}
              </button>
            </div>
            <div className="flex flex-col gap-3 border-t border-purple-500 pt-6">
              {[
                "Clientes ilimitados",
                "Calendario avanzado",
                "Generador de cotizaciones",
                "Gestor de mantenimiento",
                "Análisis detallados",
                "Chatbot IA básico",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="#e9d5ff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-white text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="flex-1 px-6 py-5 border border-purple-200 bg-white rounded-lg flex flex-col gap-8 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-gray-900 text-lg font-medium mb-2">Enterprise</h3>
                <p className="text-gray-600 text-sm">Solución personalizada para grandes agencias.</p>
              </div>
              <div>
                <div className="text-5xl font-semibold text-purple-700 mb-1">A medida</div>
                <p className="text-sm text-gray-600">Contacta para presupuesto personalizado</p>
              </div>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                Contáctanos
              </button>
            </div>
            <div className="flex flex-col gap-3 border-t border-purple-200 pt-6">
              {[
                "Todo en Professional",
                "Gestor dedicado",
                "Soporte 24/7",
                "Chatbot IA avanzado",
                "API personalizada",
                "Integraciones custom",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="#9333ea"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
