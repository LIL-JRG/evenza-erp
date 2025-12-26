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
    <div className="w-full flex justify-center items-start bg-gradient-to-b from-white to-purple-50/30">
      <div className="flex-1 px-4 md:px-12 py-20 md:py-28 flex flex-col justify-start items-center gap-16">
        {/* Header */}
        <div className="w-full max-w-3xl flex flex-col justify-center items-center text-center gap-6">
          <div className="text-gray-900 font-semibold leading-tight font-sans text-4xl md:text-5xl tracking-tight">
            Planes transparentes para cualquier tamaño de agencia
          </div>
          <div className="text-gray-600 text-lg md:text-xl font-normal leading-relaxed font-sans">
            Comienza gratis y escala conforme creces. Sin sorpresas.
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-purple-100/50 backdrop-blur-sm rounded-full border border-purple-200/50">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              billingPeriod === "monthly"
                ? "bg-white text-purple-700 shadow-lg shadow-purple-500/20"
                : "text-purple-600 hover:text-purple-700"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod("annually")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              billingPeriod === "annually"
                ? "bg-white text-purple-700 shadow-lg shadow-purple-500/20"
                : "text-purple-600 hover:text-purple-700"
            }`}
          >
            Anual
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">Ahorra 10%</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Free Plan */}
          <div className="flex-1 px-8 py-10 border-2 border-purple-200/60 bg-white rounded-2xl flex flex-col gap-10 hover:shadow-2xl hover:shadow-purple-500/15 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-gray-900 text-2xl font-bold">Gratis</h3>
                <p className="text-gray-600 text-base leading-relaxed">Perfecto para comenzar y probar la plataforma.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold text-purple-700">$0</span>
                  <span className="text-gray-600 text-lg">/mes</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Plan gratuito permanente
                </p>
              </div>
              <button
                onClick={() => router.push('/register')}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 text-base"
              >
                Comenzar gratis
              </button>
            </div>
            <div className="flex flex-col gap-4 border-t-2 border-purple-200/50 pt-8">
              {[
                "Hasta 5 clientes",
                "Hasta 5 eventos/mes",
                "Hasta 20 productos",
                "Hasta 10 contratos",
                "Dashboard completo con gráficos",
                "Calendario (solo visualización)",
                "Plantilla de cotización simple",
                "Descuentos por evento",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M11 4L5.5 9.5L3 7"
                        stroke="#9333ea"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Starter Plan */}
          <div className="flex-1 px-8 py-10 border-2 border-purple-200/60 bg-white rounded-2xl flex flex-col gap-10 hover:shadow-2xl hover:shadow-purple-500/15 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-gray-900 text-2xl font-bold">Starter</h3>
                <p className="text-gray-600 text-base leading-relaxed">Para agencias pequeñas que comienzan.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold text-purple-700">
                    ${billingPeriod === "monthly" ? pricing.standard.monthly : Math.floor(pricing.standard.annually / 12)}
                  </span>
                  <span className="text-gray-600 text-lg">/mes</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  por usuario, facturado {billingPeriod === "monthly" ? "mensualmente" : "anualmente"}
                </p>
              </div>
              <button
                onClick={() => handleCheckout("standard")}
                disabled={loading === "standard"}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-base"
              >
                {loading === "standard" ? "Procesando..." : "Comenzar gratis"}
              </button>
            </div>
            <div className="flex flex-col gap-4 border-t-2 border-purple-200/50 pt-8">
              {[
                "Hasta 100 clientes",
                "Hasta 50 eventos/mes",
                "Hasta 50 productos",
                "Hasta 50 contratos",
                "Calendario avanzado",
                "Plantilla de cotización colorida",
                "Términos y Condiciones editables",
                "Descuentos por evento",
                "Soporte por email"
              ].map(
                (feature, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M11 4L5.5 9.5L3 7"
                          stroke="#9333ea"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Professional Plan (Featured) */}
          <div className="flex-1 px-8 py-10 bg-gradient-to-br from-purple-600 via-purple-600 to-purple-700 border-2 border-purple-500 rounded-2xl flex flex-col gap-10 relative hover:shadow-2xl hover:shadow-purple-500/50 hover:-translate-y-2 transition-all duration-300 lg:scale-110 lg:z-10">
            {/* Badges */}
            <div className="absolute -top-4 left-0 right-0 flex justify-between px-6">
              <div className="bg-white px-4 py-1.5 rounded-full shadow-lg border-2 border-purple-600">
                <span className="text-purple-700 text-xs font-bold uppercase tracking-wide">Más Popular</span>
              </div>
              <div className="bg-yellow-400 px-4 py-1.5 rounded-full shadow-lg">
                <span className="text-purple-900 text-xs font-bold uppercase tracking-wide">7 Días Gratis</span>
              </div>
            </div>

            <div className="flex flex-col gap-8 pt-4">
              <div className="flex flex-col gap-3">
                <h3 className="text-white text-2xl font-bold">Professional</h3>
                <p className="text-purple-100 text-base leading-relaxed">Para agencias en crecimiento con necesidades avanzadas.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold text-white">
                    ${billingPeriod === "monthly"
                      ? pricing.professional.monthly
                      : Math.floor(pricing.professional.annually / 12)}
                  </span>
                  <span className="text-purple-200 text-lg">/mes</span>
                </div>
                <p className="text-sm text-purple-200 font-medium">
                  por usuario, facturado {billingPeriod === "monthly" ? "mensualmente" : "anualmente"}
                </p>
              </div>
              <button
                onClick={() => handleCheckout("professional")}
                disabled={loading === "professional"}
                className="w-full px-6 py-4 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-base"
              >
                {loading === "professional" ? "Procesando..." : "Comenzar 7 días gratis"}
              </button>
            </div>
            <div className="flex flex-col gap-4 border-t-2 border-purple-500/50 pt-8">
              {[
                "Clientes ilimitados",
                "Eventos ilimitados",
                "Productos ilimitados",
                "Contratos ilimitados",
                "Dashboard completo con análisis",
                "Calendario avanzado",
                "Plantilla de cotización colorida",
                "Términos y Contrato Legal editables",
                "Descuentos por evento",
                "Chatbot IA",
                "Exportar cotizaciones a PDF/CSV",
                "Soporte prioritario",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M11 4L5.5 9.5L3 7"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-sm leading-relaxed font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
