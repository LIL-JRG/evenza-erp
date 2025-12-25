"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createBrowserClient } from "@supabase/auth-helpers-nextjs"
import SmartSimpleBrilliant from "@/components/smart-simple-brilliant"
import YourWorkInSync from "@/components/your-work-in-sync"
import EffortlessIntegration from "@/components/effortless-integration-updated"
import NumbersThatSpeak from "@/components/numbers-that-speak"
import TestimonialsSection from "@/components/testimonials-section"
import FAQSection from "@/components/faq-section"
import PricingSection from "@/components/pricing-section"
import FooterSection from "@/components/footer-section"
import CTASection from "@/components/cta-section"

// Reusable Badge Component with purple accent
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-4 py-2 bg-purple-50 backdrop-blur-sm shadow-sm overflow-hidden rounded-full flex items-center gap-2 border border-purple-200 transition-all duration-300 hover:shadow-md hover:scale-105 hover:bg-purple-100">
      <div className="w-3.5 h-3.5 flex items-center justify-center text-purple-600">{icon}</div>
      <div className="text-purple-700 text-xs font-medium font-sans">
        {text}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mountedRef = useRef(true)

  // Check authentication status
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check:', { session, error, hasSession: !!session })
        setIsAuthenticated(!!session)
      } catch (err) {
        console.error('Error checking session:', err)
        setIsAuthenticated(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, hasSession: !!session })
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    mountedRef.current = true
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3)
          }
          return 0
        }
        return prev + 0.5 // Slower progress for smoother feel (approx 10s)
      })
    }, 50) // Smoother updates

    return () => {
      clearInterval(progressInterval)
      mountedRef.current = false
    }
  }, [])

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setProgress(0)
  }

  return (
    <div className="w-full min-h-screen relative bg-white flex flex-col items-center scroll-smooth">
      {/* Navigation - New Design */}
      <section className="sticky top-0 z-50 bg-white py-4 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <nav className="hidden justify-between lg:flex">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <img src="/evenza/logo_evenza_sf.png" alt="Evenza" className="h-12 w-auto" />
              </Link>
              <div className="flex items-center gap-1">
                <Link href="#features" className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all">
                  Funcionalidades
                </Link>
                <Link href="#pricing" className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all">
                  Planes
                </Link>
                <Link href="#clients" className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all">
                  Clientes
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Link href="/dashboard" className="inline-flex items-center justify-center h-8 rounded-full bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition-all gap-2">
                  Ir al panel
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="inline-flex items-center justify-center h-8 rounded-full border-0 bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-semibold transition-all">
                    Ingresar
                  </Link>
                  <Link href="/register" className="inline-flex items-center justify-center h-8 rounded-full bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition-all gap-2">
                    Comenzar
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>
          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <img src="/evenza/logo_evenza_sf.png" alt="Evenza" className="h-10 w-auto" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-200 bg-white shadow-sm hover:bg-purple-50 size-9"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                  <path d="M4 12h16"></path>
                  <path d="M4 18h16"></path>
                  <path d="M4 6h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[60] bg-black/50 animate-in fade-in-0"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sheet Content */}
          <div
            className="fixed inset-y-0 right-0 z-[70] h-full w-3/4 sm:max-w-sm bg-white shadow-lg border-l overflow-y-auto animate-in slide-in-from-right duration-500"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex flex-col gap-1.5 p-4 border-b">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <img src="/evenza/logo_evenza_sf.png" alt="Evenza" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-6 p-4">
              <div className="flex flex-col gap-4">
                <Link
                  href="#features"
                  className="text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Funcionalidades
                </Link>
                <Link
                  href="#pricing"
                  className="text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Planes
                </Link>
                <Link
                  href="#clients"
                  className="text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Clientes
                </Link>
              </div>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center h-10 rounded-full bg-purple-600 text-white px-6 py-2 text-sm font-semibold hover:bg-purple-700 transition-all gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ir al panel
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 px-6 py-2 text-sm font-semibold shadow-sm transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Ingresar
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center h-10 rounded-full bg-purple-600 text-white px-6 py-2 text-sm font-semibold hover:bg-purple-700 transition-all gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Comenzar
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              <span className="sr-only">Cerrar</span>
            </button>
          </div>
        </>
      )}

      {/* Hero Section - Full viewport with background image */}
      <section className="relative w-full">
        <img
          src="/hero-bg.webp"
          alt="Hero background"
          className="absolute inset-0 w-full h-full rounded-t-3xl z-0 object-cover object-center"
          loading="eager"
        />
        <div className="relative flex flex-col items-center w-full min-h-screen md:min-h-[200vh] z-10 pt-24 px-4 md:px-8">
          <div className="w-full max-w-[937px] flex flex-col items-center gap-6 sm:gap-8 animate-fade-in">
          <div className="flex items-center gap-2">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-1 py-1 font-semibold text-sm shadow-sm hover:bg-white/20 transition-all duration-300 border border-white/20 pr-3 text-white group">
              <span className="flex items-center justify-between h-6 px-3 rounded-full bg-white text-purple-700 text-xs font-semibold mr-1 shadow-sm">
                Nuevo
              </span>
              <span className="font-semibold text-sm">7 días de prueba gratuita</span>
              <span className="ml-1">
                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <h1 className="w-full max-w-[900px] text-center text-white text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold leading-tight font-sans px-2 sm:px-4 md:px-0 tracking-tight drop-shadow-lg flex flex-col items-center">
              <span className="whitespace-nowrap">Gestiona tu mobiliario</span>
              <span className="whitespace-nowrap">con <span className="text-purple-400 font-bold drop-shadow-lg">Evenza</span></span>
            </h1>
            <p className="w-full max-w-[506px] text-center text-white/90 text-base sm:text-lg md:text-xl leading-relaxed font-sans px-2 sm:px-4 md:px-0 font-medium drop-shadow-md">
              El ERP completo para agencias de rentales de mobiliario y equipo.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Link href="/register" className="group relative h-12 sm:h-14 px-10 sm:px-12 md:px-14 py-3 bg-gradient-to-r from-purple-600 to-purple-700 overflow-hidden rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative text-white text-sm sm:text-base font-semibold font-sans">
                Comenzar gratis
              </span>
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Content Wrapper - Responsive width */}
      <div className="w-full flex justify-center">
        <div className="w-full px-4 sm:px-6 md:max-w-[85vw] lg:max-w-[80vw] flex flex-col items-center">

      {/* Dashboard Preview Section */}
      <div className="w-full bg-white pt-16 md:pt-20 pb-0 flex flex-col items-center px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-6xl flex flex-col items-center gap-6">
          {/* Preview Container with Enhanced Shadow */}
          <div className="relative w-full group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition duration-700"></div>

            {/* Main Preview */}
            <div className="relative w-full h-[280px] sm:h-[360px] md:h-[500px] lg:h-[650px] bg-white backdrop-blur-sm shadow-2xl shadow-purple-500/20 border-2 border-purple-200/60 overflow-hidden rounded-2xl lg:rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-300/80">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full overflow-hidden">
                  {/* Product Image 1 */}
                  <div
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      activeCard === 0
                        ? "opacity-100 scale-100 blur-none translate-x-0"
                        : "opacity-0 scale-95 blur-md -translate-x-8"
                    }`}
                  >
                    <img
                      src="/images/dsadsadsa.jpeg"
                      alt="Schedules Dashboard - Customer Subscription Management"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Image 2 */}
                  <div
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      activeCard === 1
                        ? "opacity-100 scale-100 blur-none translate-x-0"
                        : "opacity-0 scale-95 blur-md -translate-x-8"
                    }`}
                  >
                    <img
                      src="/analytics-dashboard-with-charts-graphs-and-data-vi.jpg"
                      alt="Analytics Dashboard"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Image 3 */}
                  <div
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      activeCard === 2
                        ? "opacity-100 scale-100 blur-none translate-x-0"
                        : "opacity-0 scale-95 blur-md -translate-x-8"
                    }`}
                  >
                    <img
                      src="/data-visualization-dashboard-with-interactive-char.jpg"
                      alt="Data Visualization Dashboard"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="w-full border-t border-purple-200/50 flex justify-center items-start bg-gradient-to-b from-white via-purple-50/10 to-white pb-0">
        <div className="w-full max-w-6xl px-2 sm:px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 py-8 md:py-12">
          {/* Feature Cards */}
          <FeatureCard
            title="Gestión de Clientes"
            description="Administra contratos de renta, documentos y datos de clientes en un único dashboard intuitivo."
            isActive={activeCard === 0}
            progress={activeCard === 0 ? progress : 0}
            onClick={() => handleCardClick(0)}
          />
          <FeatureCard
            title="Calendario y Eventos"
            description="Planifica entregas, eventos y mantenimiento con un calendario integrado y notificaciones automáticas."
            isActive={activeCard === 1}
            progress={activeCard === 1 ? progress : 0}
            onClick={() => handleCardClick(1)}
          />
          <FeatureCard
            title="Cotizaciones y Análisis"
            description="Genera cotizaciones profesionales, contratos automáticos y analiza el desempeño de tu negocio."
            isActive={activeCard === 2}
            progress={activeCard === 2 ? progress : 0}
            onClick={() => handleCardClick(2)}
          />
        </div>
      </div>

            {/* Bento Grid Section - Clean white with purple accents */}
            <div id="features" className="w-full border-b border-purple-200/50 flex flex-col items-center scroll-mt-32 bg-white">
                {/* Header Section */}
                <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 border-b border-purple-200/50 flex justify-center items-center">
                  <div className="w-full max-w-[616px] px-4 sm:px-6 py-6 flex flex-col items-center gap-6">
                    <Badge
                      icon={
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="1" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="7" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                        </svg>
                      }
                      text="Módulos"
                    />
                    <h2 className="w-full max-w-[598px] text-center text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight font-sans tracking-tight">
                      Construido para claridad absoluta y trabajo enfocado
                    </h2>
                    <p className="text-center text-gray-600 text-base sm:text-lg font-normal leading-relaxed font-sans">
                      Mantente enfocado con herramientas que organizan, conectan y convierten la información en decisiones confiables.
                    </p>
                  </div>
                </div>

                {/* Bento Grid Content - Clean white */}
                <div className="self-stretch flex justify-center items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-purple-200/50">
                    {/* Top Left - Smart. Simple. Brilliant. */}
                    <div className="border-b border-r-0 md:border-r border-purple-200/50 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 hover:bg-purple-50/20 transition-colors duration-300">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-gray-900 text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Inteligente. Simple. Brillante.
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-normal leading-relaxed font-sans">
                          Tus datos están hermosamente organizados para que veas todo claramente sin desorden.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex items-center justify-center overflow-hidden">
                        <SmartSimpleBrilliant
                          width="100%"
                          height="100%"
                          theme="light"
                          className="scale-50 sm:scale-65 md:scale-75 lg:scale-90"
                        />
                      </div>
                    </div>

                    {/* Top Right - Your work, in sync */}
                    <div className="border-b border-purple-200/50 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 hover:bg-purple-50/20 transition-colors duration-300">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-gray-900 font-semibold leading-tight font-sans text-lg sm:text-xl">
                          Tu trabajo, sincronizado
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-normal leading-relaxed font-sans">
                          Cada actualización fluye instantáneamente en todo tu equipo y mantiene la colaboración sin
                          esfuerzo y rápida.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden text-right items-center justify-center">
                        <YourWorkInSync
                          width="400"
                          height="250"
                          theme="light"
                          className="scale-60 sm:scale-75 md:scale-90"
                        />
                      </div>
                    </div>

                    {/* Bottom Left - Effortless integration */}
                    <div className="border-r-0 md:border-r border-purple-200/50 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 bg-transparent hover:bg-purple-50/20 transition-colors duration-300">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-gray-900 text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Integración sin esfuerzo
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-normal leading-relaxed font-sans">
                          Todas tus herramientas favoritas se conectan en un lugar y funcionan juntas sin problemas por
                          diseño.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden justify-center items-center relative bg-transparent">
                        <div className="w-full h-full flex items-center justify-center bg-transparent">
                          <EffortlessIntegration width={400} height={250} className="max-w-full max-h-full" />
                        </div>
                        {/* Gradient mask for soft bottom edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Bottom Right - Numbers that speak */}
                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 hover:bg-purple-50/20 transition-colors duration-300">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-gray-900 text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Números que hablan
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base font-normal leading-relaxed font-sans">
                          Rastrea el crecimiento con precisión y convierte datos brutos en decisiones confiables en las
                          que puedas confiar.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative">
                        <NumbersThatSpeak
                          width="100%"
                          height="100%"
                          theme="light"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
            </div>

      {/* Social Proof Section - Clean white design */}
      <div className="w-full border-b border-purple-200/50 flex flex-col items-center bg-white">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-24 py-12 sm:py-16 md:py-20 border-b border-purple-200/50 flex justify-center items-center">
          <div className="w-full max-w-[586px] px-4 sm:px-6 py-6 flex flex-col items-center gap-6">
                    <Badge
                      icon={
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="3" width="4" height="6" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="2" y="4" width="1" height="1" fill="currentColor" />
                          <rect x="3.5" y="4" width="1" height="1" fill="currentColor" />
                          <rect x="2" y="5.5" width="1" height="1" fill="currentColor" />
                          <rect x="3.5" y="5.5" width="1" height="1" fill="currentColor" />
                          <rect x="8" y="2" width="1" height="1" fill="currentColor" />
                          <rect x="9.5" y="2" width="1" height="1" fill="currentColor" />
                          <rect x="8" y="3.5" width="1" height="1" fill="currentColor" />
                          <rect x="9.5" y="3.5" width="1" height="1" fill="currentColor" />
                          <rect x="8" y="5" width="1" height="1" fill="currentColor" />
                          <rect x="9.5" y="5" width="1" height="1" fill="currentColor" />
                        </svg>
                      }
                      text="Aliados"
                    />
                    <h2 className="w-full max-w-[472px] text-center text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight font-sans tracking-tight">
                      Confianza respaldada por resultados
                    </h2>
                    <p className="text-center text-gray-600 text-base sm:text-lg font-normal leading-relaxed font-sans">
                      Nuestros clientes logran más cada día porque sus herramientas son simples, poderosas y claras.
                    </p>
                  </div>
                </div>

                {/* Logo Grid - Clean white */}
                <div className="self-stretch border-t border-purple-200/50 flex justify-center items-start">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-0 border-l border-r border-purple-200/50">
                    {/* Logo Grid - Clean white responsive grid */}
                    {Array.from({ length: 8 }).map((_, index) => {
                      const isBottomRow = index >= 4

                      return (
                        <div
                          key={index}
                          className={`
                            h-28 sm:h-32 md:h-36 lg:h-40 flex justify-center items-center gap-3 transition-all duration-300 hover:bg-purple-50/30
                            border-b border-r border-purple-200/30
                            ${isBottomRow ? "border-b-purple-200/50" : ""}
                          `}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 relative overflow-hidden rounded-full shadow-sm shadow-purple-500/10">
                            <img src="/horizon-icon.svg" alt="Horizon" className="w-full h-full object-contain" />
                          </div>
                          <div className="text-center text-gray-800 text-base sm:text-lg md:text-xl lg:text-2xl font-medium font-sans">
                            Acute
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
            </div>

      {/* Testimonials Section */}
      <div id="clients" className="scroll-mt-32 w-full">
        <TestimonialsSection />
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="scroll-mt-32 w-full">
        <PricingSection />
      </div>

      {/* FAQ Section */}
      <FAQSection />
        </div>
      </div>

      {/* CTA Section */}
      <CTASection />

      {/* Footer Section */}
      <FooterSection />
    </div>
  )
}

// FeatureCard component with enhanced design
function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string
  description: string
  isActive: boolean
  progress: number
  onClick: () => void
}) {
  return (
    <div
      className={`group relative px-6 sm:px-8 py-6 sm:py-8 overflow-hidden flex flex-col justify-start items-start gap-4 cursor-pointer transition-all duration-300 rounded-xl md:rounded-2xl border-2 ${
        isActive
          ? "bg-gradient-to-br from-purple-50 to-white border-purple-300 shadow-xl shadow-purple-500/20 md:scale-105"
          : "bg-white border-purple-200/50 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/10"
      }`}
      onClick={onClick}
    >
      {/* Progress Bar */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-purple-100 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-100 ease-linear shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
        isActive
          ? "bg-purple-600 shadow-lg shadow-purple-500/40"
          : "bg-purple-100 group-hover:bg-purple-200"
      }`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isActive ? "text-white" : "text-purple-600"}>
          <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className={`text-lg font-bold leading-tight font-sans transition-colors duration-300 ${
          isActive ? "text-purple-700" : "text-gray-900 group-hover:text-purple-700"
        }`}>
          {title}
        </h3>
        <p className={`text-sm font-normal leading-relaxed font-sans transition-colors duration-300 ${
          isActive ? "text-gray-700" : "text-gray-600"
        }`}>
          {description}
        </p>
      </div>
    </div>
  )
}