"use client"

import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "¿Qué es Evenza?",
    answer:
      "Evenza es un ERP (Sistema de Planificación de Recursos Empresariales) completo diseñado específicamente para agencias de rentales de mobiliario. Integra gestión de clientes, calendario, cotizaciones, contratos, mantenimiento y un chatbot IA para automatizar tu negocio.",
  },
  {
    question: "¿Cómo funciona la generación de cotizaciones?",
    answer:
      "Puedes crear cotizaciones profesionales en segundos. El sistema calcula automáticamente precios basados en tus clientes, cantidad de mobiliario y duración del rental. Luego genera contratos profesionales listos para firmar.",
  },
  {
    question: "¿Puedo integrar Evenza con mis sistemas actuales?",
    answer:
      "Sí, Evenza ofrece integraciones con sistemas de pago, email, almacenamiento en la nube y más. También contamos con API para integraciones personalizadas según tus necesidades.",
  },
  {
    question: "¿Cuál es el soporte que ofrecen?",
    answer:
      "Ofrecemos soporte por email en todos los planes, chat en tiempo real en planes Professional y Enterprise, y soporte telefónico 24/7 para clientes Enterprise. Además, todos tienen acceso a documentación completa y tutoriales en video.",
  },
  {
    question: "¿Qué incluye el chatbot IA?",
    answer:
      "El chatbot IA responde preguntas frecuentes de tus clientes automáticamente, agenda citas, proporciona información sobre disponibilidad y precios. En planes Enterprise, es totalmente personalizable con tu marca y procesos específicos.",
  },
  {
    question: "¿Cómo empiezo con Evenza?",
    answer:
      "Es muy simple: crea una cuenta gratis, completa tu perfil de empresa, agrega tus clientes y comienzas a crear cotizaciones. Nuestro equipo de onboarding te guiará en los primeros pasos. En 24 horas, tu agencia estará lista para usar todas las funcionalidades.",
  },
]

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="w-full flex justify-center items-start bg-white">
      <div className="flex-1 px-4 md:px-12 py-20 md:py-28 flex flex-col lg:flex-row justify-start items-start gap-12 lg:gap-20 max-w-7xl mx-auto">
        {/* Left Column - Header */}
        <div className="w-full lg:w-2/5 flex flex-col justify-start items-start gap-6 lg:sticky lg:top-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1v14M1 8h14" stroke="#9333ea" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-purple-700 text-sm font-semibold">FAQ</span>
          </div>
          <h2 className="text-gray-900 font-bold leading-tight font-sans text-4xl md:text-5xl tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-gray-600 text-lg font-normal leading-relaxed font-sans">
            Todo lo que necesitas saber sobre Evenza para gestionar tu agencia de rentales.
          </p>
        </div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col gap-4">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index)

              return (
                <div
                  key={index}
                  className={`w-full overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    isOpen
                      ? "border-purple-300 bg-purple-50/50 shadow-lg shadow-purple-500/10"
                      : "border-purple-200/50 bg-white hover:border-purple-300/60 hover:shadow-md"
                  }`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 flex justify-between items-center gap-5 text-left transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 text-gray-900 text-lg font-semibold leading-7 font-sans">
                      {item.question}
                    </div>
                    <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                      <ChevronDownIcon
                        className={`w-5 h-5 text-purple-600 transition-transform duration-300 ease-in-out ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-6 text-gray-600 text-base font-normal leading-7 font-sans">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
