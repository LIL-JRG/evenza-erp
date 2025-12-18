"use client"

import type React from "react"

import { useState } from "react"

export default function WaitlistSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido")
      return
    }

    // Aquí iría la lógica para guardar el email en la base de datos
    console.log("Email agregado a waitlist:", email)
    setSubmitted(true)
    setEmail("")

    // Resetear después de 5 segundos
    setTimeout(() => {
      setSubmitted(false)
    }, 5000)
  }

  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
      {/* Content */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-t border-b border-[rgba(31,58,82,0.12)] flex justify-center items-center gap-6 relative z-10">
        {/* Background pattern */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="w-full h-full relative">
            {Array.from({ length: 300 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-4 w-full rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                style={{
                  top: `${i * 16 - 120}px`,
                  left: "-100%",
                  width: "300%",
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[586px] px-6 py-5 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center flex justify-center flex-col text-[#1f3a52] text-3xl md:text-5xl font-semibold leading-tight md:leading-[56px] font-sans tracking-tight">
              Sé de los primeros en Evenza
            </div>
            <div className="self-stretch text-center text-[#5a7a8f] text-base leading-7 font-sans font-medium">
              Únete a nuestra waitlist y recibe acceso prioritario cuando lancemos nuevas funcionalidades.
              <br />
              Serás de los primeros en optimizar tu agencia de rentales.
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[497px] flex flex-col justify-center items-center gap-4"
          >
            <div className="w-full flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 md:py-4 text-[#1f3a52] bg-white border border-[rgba(31,58,82,0.2)] rounded-full focus:outline-none focus:ring-2 focus:ring-[#5ba3d0] focus:ring-opacity-50 transition-all placeholder:text-[#5a7a8f]"
                disabled={submitted}
              />
              {error && <div className="text-red-500 text-sm px-4">{error}</div>}
            </div>

            <button
              type="submit"
              disabled={submitted}
              className="w-full h-10 px-6 py-[6px] relative bg-[#5ba3d0] hover:bg-[#4a92b8] transition-colors shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <div className="w-full h-[41px] absolute left-0 top-0 bg-gradient-to-b from-[rgba(255,255,255,0.1)] to-[rgba(0,0,0,0.08)] mix-blend-multiply"></div>
              <div className="flex flex-col justify-center text-white text-[13px] font-medium leading-5 font-sans">
                {submitted ? "¡Te agregamos! 🎉" : "Unirse a la waitlist"}
              </div>
            </button>
          </form>

          {submitted && (
            <div className="w-full max-w-[497px] px-4 py-3 bg-[#f0f4f9] border border-[#5ba3d0] rounded-lg text-center">
              <div className="text-[#1f3a52] text-sm font-medium">
                ¡Gracias! Te enviaremos un correo cuando Evenza esté listo.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
