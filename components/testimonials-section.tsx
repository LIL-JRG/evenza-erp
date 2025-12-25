"use client"

import { useState, useEffect } from "react"
import type React from "react"

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-white shadow-[0px_0px_0px_4px_rgba(31,58,82,0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-[rgba(2,6,23,0.08)] shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">{icon}</div>
      <div className="text-center flex justify-center flex-col text-[#1f3a52] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const testimonials = [
    {
      quote:
        "Evenza nos ha ahorrado más de 15 horas por semana en gestión administrativa. Nuestros clientes están más felices y nosotros mucho menos estresados.",
      name: "Carlos Mendoza",
      company: "Fundador, Mobiliario Premium",
      image: "/images/chatgpt-20image-20sep-2011-2c-202025-2c-2011-35-19-20am.png",
    },
    {
      quote:
        "Con el chatbot IA de Evenza, nuestros clientes reciben respuestas inmediatas a sus preguntas. Hemos reducido en 40% el volumen de emails de soporte.",
      name: "María García",
      company: "Directora, Rentales Ejecutivas",
      image: "/images/chatgpt-20image-20sep-2011-2c-202025-2c-2010-54-18-20am.png",
    },
    {
      quote:
        "El módulo de mantenimiento es increíble. Ahora sabemos exactamente cuándo necesita servicio cada mueble. Nuestro inventario está en perfecto estado.",
      name: "Roberto Díaz",
      company: "Gerente, Solutions Mobiliarias",
      image: "/images/chatgpt-20image-20sep-2011-2c-202025-2c-2011-01-05-20am.png",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 100)
      }, 300)
    }, 12000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  const handleNavigationClick = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveTestimonial(index)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 100)
    }, 300)
  }

  return (
    <div className="w-full border-b border-purple-200/50 flex flex-col justify-center items-center bg-white">
      {/* Testimonial Content */}
      <div className="w-full px-4 sm:px-6 md:px-12 py-20 md:py-24 flex justify-center items-center">
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
          {/* Image */}
          <div className="w-full md:w-auto flex justify-center md:justify-start">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-700"></div>
              <img
                className="relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-2xl object-cover shadow-xl shadow-purple-500/20 transition-all duration-700 ease-in-out"
                style={{
                  opacity: isTransitioning ? 0.6 : 1,
                  transform: isTransitioning ? "scale(0.95)" : "scale(1)",
                }}
                src={testimonials[activeTestimonial].image || "/placeholder.svg"}
                alt={testimonials[activeTestimonial].name}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-start items-start gap-8 max-w-2xl">
            {/* Quote Icon */}
            <div className="text-purple-600/20">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                <path d="M12 34h7l5-10V10H10v14h7l-5 10zm20 0h7l5-10V10H30v14h7l-5 10z"/>
              </svg>
            </div>

            {/* Quote Text */}
            <blockquote
              className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-medium leading-tight font-sans transition-all duration-700 ease-in-out"
              style={{
                filter: isTransitioning ? "blur(4px)" : "blur(0px)",
                opacity: isTransitioning ? 0.5 : 1,
              }}
            >
              "{testimonials[activeTestimonial].quote}"
            </blockquote>

            {/* Author Info */}
            <div
              className="flex flex-col gap-1 transition-all duration-700 ease-in-out"
              style={{
                filter: isTransitioning ? "blur(4px)" : "blur(0px)",
                opacity: isTransitioning ? 0.5 : 1,
              }}
            >
              <div className="text-gray-900 text-lg font-semibold">
                {testimonials[activeTestimonial].name}
              </div>
              <div className="text-purple-600 text-base font-medium">
                {testimonials[activeTestimonial].company}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => handleNavigationClick((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
                className="w-12 h-12 rounded-full border-2 border-purple-200 bg-white flex items-center justify-center hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
                aria-label="Testimonial anterior"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-600 group-hover:text-purple-700">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigationClick(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === activeTestimonial
                        ? "w-8 h-2 bg-purple-600"
                        : "w-2 h-2 bg-purple-200 hover:bg-purple-300"
                    }`}
                    aria-label={`Ir al testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => handleNavigationClick((activeTestimonial + 1) % testimonials.length)}
                className="w-12 h-12 rounded-full border-2 border-purple-200 bg-white flex items-center justify-center hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
                aria-label="Siguiente testimonial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-600 group-hover:text-purple-700">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
