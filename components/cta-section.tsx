"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10">
        <div className="w-full h-full relative">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-4 w-full rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-white outline-offset-[-0.25px]"
              style={{
                top: `${i * 20 - 80}px`,
                left: "-100%",
                width: "300%",
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 md:px-12 py-24 md:py-32 flex justify-center items-center relative z-10">
        <div className="w-full max-w-4xl flex flex-col justify-center items-center gap-12 text-center">
          {/* Heading */}
          <div className="flex flex-col gap-6">
            <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-sans tracking-tight">
              ¿Listo para transformar tu agencia?
            </h2>
            <p className="text-purple-100 text-lg md:text-xl leading-relaxed font-sans max-w-2xl mx-auto">
              Únete a cientos de agencias que ya optimizan sus rentales, administran clientes y generan más ganancias con Evenza.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-purple-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              Comenzar gratis hoy
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#pricing"
              className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Ver planes
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-8 text-purple-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span className="text-sm font-medium">7 días de prueba gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-sm font-medium">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span className="text-sm font-medium">Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
