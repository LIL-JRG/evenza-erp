"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Cookie, Settings } from "lucide-react"

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("evenza_cookie_consent")
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("evenza_cookie_consent", JSON.stringify({
      essential: true,
      analytics: true,
      functionality: true,
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
  }

  const acceptEssential = () => {
    localStorage.setItem("evenza_cookie_consent", JSON.stringify({
      essential: true,
      analytics: false,
      functionality: false,
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
  }

  const savePreferences = (essential: boolean, analytics: boolean, functionality: boolean) => {
    localStorage.setItem("evenza_cookie_consent", JSON.stringify({
      essential,
      analytics,
      functionality,
      timestamp: new Date().toISOString()
    }))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={() => setShowBanner(false)} />

      {/* Banner */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-purple-200 pointer-events-auto animate-in slide-in-from-bottom duration-300">
        {/* Close button */}
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-50 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                🍪 Utilizamos cookies
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Usamos cookies para mejorar tu experiencia, analizar el uso del sitio y personalizar el contenido.
                Puedes elegir qué cookies aceptar o{" "}
                <Link href="/cookies" className="text-purple-600 hover:underline font-medium">
                  leer más sobre nuestra política de cookies
                </Link>.
              </p>
            </div>
          </div>

          {/* Details Section */}
          {showDetails && (
            <div className="mt-6 mb-6 space-y-4 border-t border-purple-100 pt-6">
              <CookieToggle
                title="Cookies esenciales"
                description="Necesarias para el funcionamiento básico del sitio. No se pueden desactivar."
                checked={true}
                disabled={true}
              />
              <CookieToggle
                title="Cookies de análisis"
                description="Nos ayudan a entender cómo usas Evenza para mejorar tu experiencia."
                checked={true}
                onChange={() => {}}
                id="analytics"
              />
              <CookieToggle
                title="Cookies de funcionalidad"
                description="Permiten recordar tus preferencias y configuraciones."
                checked={true}
                onChange={() => {}}
                id="functionality"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={acceptAll}
              className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30"
            >
              Aceptar todas
            </button>
            <button
              onClick={acceptEssential}
              className="flex-1 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Solo esenciales
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="sm:w-auto px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Personalizar</span>
              <span className="sm:hidden">Configurar</span>
            </button>
          </div>

          {/* Footer links */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-purple-600 transition-colors">
              Política de Privacidad
            </Link>
            {" · "}
            <Link href="/terms" className="hover:text-purple-600 transition-colors">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Cookie Toggle Component
function CookieToggle({
  title,
  description,
  checked,
  disabled = false,
  onChange,
  id
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: () => void
  id?: string
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-purple-50/50 rounded-lg">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <div className="flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            id={id}
          />
          <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
        </label>
      </div>
    </div>
  )
}
