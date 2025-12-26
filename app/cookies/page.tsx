import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b border-purple-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/evenza/logo_evenza_sf.png" alt="Evenza" className="h-10 w-auto" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Política de Cookies
          </h1>
          <p className="text-gray-600 text-lg">
            Última actualización: 25 de diciembre de 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ¿Qué son las cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computadora, tablet o móvil) cuando visitas un sitio web. Las cookies permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo.
            </p>
            <p className="text-gray-700 leading-relaxed">
              En Evenza utilizamos cookies y tecnologías similares para mejorar tu experiencia, proporcionar funcionalidades esenciales y analizar cómo se utiliza nuestra plataforma.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tipos de cookies que utilizamos</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Cookies estrictamente necesarias</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estas cookies son esenciales para que puedas navegar por Evenza y utilizar sus funciones básicas. Sin estas cookies, no podríamos proporcionar servicios fundamentales como:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Inicio de sesión y autenticación</li>
              <li>Mantenimiento de tu sesión activa</li>
              <li>Seguridad y prevención de fraude</li>
              <li>Funcionalidad del carrito de compras</li>
              <li>Recordar tu consentimiento de cookies</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              <strong>Estas cookies no requieren tu consentimiento</strong> ya que son necesarias para el funcionamiento del servicio.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Cookies de rendimiento y análisis</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estas cookies nos ayudan a entender cómo los usuarios interactúan con Evenza, recopilando información de forma anónima sobre:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Páginas visitadas y tiempo en cada página</li>
              <li>Rutas de navegación dentro de la plataforma</li>
              <li>Errores técnicos encontrados</li>
              <li>Velocidad de carga de páginas</li>
              <li>Dispositivo y navegador utilizado</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos estas herramientas de análisis:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Google Analytics:</strong> Para análisis de uso y comportamiento</li>
              <li><strong>Vercel Analytics:</strong> Para métricas de rendimiento</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Cookies de funcionalidad</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estas cookies permiten que Evenza recuerde las elecciones que haces para proporcionarte una experiencia más personalizada:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Idioma preferido</li>
              <li>Configuraciones de visualización (modo oscuro/claro)</li>
              <li>Tamaño de fuente preferido</li>
              <li>Filtros y ordenamientos guardados</li>
              <li>Preferencias de notificaciones</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.4 Cookies de marketing (solo con tu consentimiento)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Actualmente, Evenza no utiliza cookies de marketing o publicidad de terceros. Si en el futuro implementamos estas cookies, siempre requerirán tu consentimiento explícito.
            </p>
          </section>

          {/* Duration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Duración de las cookies</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Cookies de sesión</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Se eliminan automáticamente cuando cierras tu navegador. Las utilizamos para mantener tu sesión activa mientras usas Evenza.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Cookies persistentes</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permanecen en tu dispositivo durante un período específico o hasta que las elimines manualmente:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Preferencias de usuario:</strong> Hasta 1 año</li>
              <li><strong>Consentimiento de cookies:</strong> Hasta 1 año</li>
              <li><strong>Analytics:</strong> Hasta 2 años</li>
              <li><strong>Autenticación:</strong> Hasta 30 días o cierre de sesión</li>
            </ul>
          </section>

          {/* Cookie Details Table */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Detalle de cookies específicas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-purple-200 rounded-lg overflow-hidden">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-purple-200">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-purple-200">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-purple-200">Duración</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-purple-200">Propósito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">sb-access-token</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Esencial</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Sesión</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Autenticación de usuario</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">sb-refresh-token</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Esencial</td>
                    <td className="px-4 py-3 text-sm text-gray-700">30 días</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Renovación automática de sesión</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">evenza_consent</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Esencial</td>
                    <td className="px-4 py-3 text-sm text-gray-700">1 año</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Almacena tu preferencia de cookies</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">evenza_preferences</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Funcionalidad</td>
                    <td className="px-4 py-3 text-sm text-gray-700">1 año</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Configuraciones y preferencias del usuario</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">_ga</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Análisis</td>
                    <td className="px-4 py-3 text-sm text-gray-700">2 años</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Google Analytics - Distinguir usuarios</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">_ga_*</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Análisis</td>
                    <td className="px-4 py-3 text-sm text-gray-700">2 años</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Google Analytics - Estado de sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Third Party Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies de terceros</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Algunos servicios externos que utilizamos pueden establecer sus propias cookies:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
              <li>
                <strong>Google Analytics:</strong> Para análisis de uso. Puedes optar por no participar en{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  https://tools.google.com/dlpage/gaoptout
                </a>
              </li>
              <li>
                <strong>Stripe:</strong> Para procesamiento de pagos (si aplica a tu suscripción)
              </li>
              <li>
                <strong>Supabase:</strong> Para autenticación y base de datos
              </li>
            </ul>
          </section>

          {/* Managing Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cómo gestionar las cookies</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">A través de Evenza</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puedes cambiar tus preferencias de cookies en cualquier momento haciendo clic en el botón &quot;Preferencias de Cookies&quot; que aparece en el pie de página de nuestro sitio.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">A través de tu navegador</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              La mayoría de los navegadores te permiten controlar las cookies a través de su configuración. Puedes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Ver qué cookies están almacenadas</li>
              <li>Eliminar cookies individuales o todas</li>
              <li>Bloquear cookies de sitios específicos</li>
              <li>Bloquear todas las cookies de terceros</li>
              <li>Eliminar todas las cookies al cerrar el navegador</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mb-4">
              Aquí puedes encontrar información sobre cómo gestionar cookies en navegadores populares:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/es-mx/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-amber-900 text-sm leading-relaxed">
                <strong>Importante:</strong> Ten en cuenta que bloquear o eliminar cookies puede afectar tu experiencia en Evenza y algunas funcionalidades podrían no estar disponibles.
              </p>
            </div>
          </section>

          {/* Do Not Track */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Señales de &quot;No rastrear&quot;</h2>
            <p className="text-gray-700 leading-relaxed">
              Algunos navegadores tienen una función de &quot;No rastrear&quot; (Do Not Track) que indica a los sitios web que no deseas ser rastreado. Actualmente no existe un estándar industria sobre cómo responder a estas señales. Evenza respeta tu privacidad y no rastrea tu comportamiento fuera de nuestra plataforma.
            </p>
          </section>

          {/* Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cambios a esta política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies que utilizamos o por razones operativas, legales o regulatorias. Te notificaremos sobre cambios significativos y solicitaremos tu consentimiento nuevamente si es necesario.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Más información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas sobre cómo utilizamos las cookies, contáctanos:
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> <span className="text-purple-600">privacidad@evenza.mx</span>
              </p>
              <p className="text-gray-700">
                También puedes consultar nuestra <Link href="/privacy" className="text-purple-600 hover:underline font-medium">Política de Privacidad</Link> para obtener más información sobre cómo protegemos tus datos.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-200/50 bg-white mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2025 Evenza. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-purple-600 transition-colors">
                Privacidad
              </Link>
              <Link href="/terms" className="hover:text-purple-600 transition-colors">
                Términos
              </Link>
              <Link href="/cookies" className="hover:text-purple-600 transition-colors font-medium">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
