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
    <div className="w-full flex justify-center items-start">
      <div className="flex-1 px-4 md:px-12 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12">
        {/* Left Column - Header */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5">
          <div className="w-full flex flex-col justify-center text-gray-900 font-semibold leading-tight md:leading-[44px] font-sans text-4xl tracking-tight">
            Preguntas Frecuentes
          </div>
          <div className="w-full text-gray-600 text-base font-normal leading-7 font-sans">
            Todo lo que necesitas saber sobre Evenza
            <br className="hidden md:block" />
            para gestionar tu agencia de rentales.
          </div>
        </div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index)

              return (
                <div key={index} className="w-full border-b border-purple-200/50 overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-[18px] flex justify-between items-center gap-5 text-left hover:bg-purple-50/50 transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 text-gray-900 text-base font-medium leading-6 font-sans">
                      {item.question}
                    </div>
                    <div className="flex justify-center items-center">
                      <ChevronDownIcon
                        className={`w-6 h-6 text-purple-600/60 transition-transform duration-300 ease-in-out ${
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
                    <div className="px-5 pb-[18px] text-gray-600 text-sm font-normal leading-6 font-sans">
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
