import Link from "next/link"

export default function FooterSection() {
  return (
    <div className="w-full bg-white border-t border-purple-200/50">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <img src="/evenza/logo_evenza_sf.png" alt="Evenza" className="h-12 w-auto" />
            </div>
            <p className="text-gray-600 text-base leading-relaxed max-w-sm">
              ERP completo para agencias de rentales de mobiliario. Gestiona clientes, eventos, cotizaciones y contratos en una sola plataforma.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-white border border-purple-200 flex items-center justify-center hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-purple-600">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill="currentColor"
                  />
                </svg>
              </Link>

              <Link
                href="#"
                className="w-10 h-10 rounded-full bg-white border border-purple-200 flex items-center justify-center hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-700 group-hover:text-purple-600">
                  <path
                    d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"
                    fill="currentColor"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Product Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider">
              Producto
            </h3>
            <ul className="flex flex-col gap-3">
              {["Características", "Planes", "Integraciones", "Seguridad", "Chatbot IA"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 text-sm hover:text-purple-600 transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider">
              Empresa
            </h3>
            <ul className="flex flex-col gap-3">
              {["Quiénes somos", "Nuestro equipo", "Empleos", "Blog", "Contacto"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 text-sm hover:text-purple-600 transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider">
              Recursos
            </h3>
            <ul className="flex flex-col gap-3">
              {["Términos de uso", "Referencia API", "Documentación", "Comunidad", "Soporte"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-gray-600 text-sm hover:text-purple-600 transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-purple-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2025 Evenza. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Términos
              </Link>
              <Link href="#" className="hover:text-purple-600 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
