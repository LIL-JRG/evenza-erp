import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b border-purple-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/evenza/logo_evenza_sf.png" alt="Evenza" width={96} height={32} className="h-8 w-auto" priority />
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
            Términos y Condiciones
          </h1>
          <p className="text-gray-600 text-lg">
            Última actualización: 25 de diciembre de 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bienvenido a Evenza. Estos Términos y Condiciones (&quot;Términos&quot;) rigen el uso de nuestra plataforma de gestión empresarial para agencias de rentales de mobiliario (&quot;Servicio&quot;). Al acceder o utilizar Evenza, aceptas estar sujeto a estos Términos.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro Servicio.
            </p>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Registro de Cuenta</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para utilizar Evenza, debes crear una cuenta proporcionando información precisa y completa. Eres responsable de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantener la confidencialidad de tu contraseña y credenciales de acceso</li>
              <li>Todas las actividades que ocurran bajo tu cuenta</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
              <li>Proporcionar información veraz y actualizada</li>
            </ul>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Descripción del Servicio</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Evenza es una plataforma SaaS (Software as a Service) que proporciona herramientas para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Gestión de clientes y contactos</li>
              <li>Administración de inventario de mobiliario</li>
              <li>Creación de cotizaciones y contratos</li>
              <li>Emisión de recibos y documentación</li>
              <li>Seguimiento de eventos y calendario</li>
              <li>Generación de reportes y análisis</li>
            </ul>
          </section>

          {/* Subscription and Payment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Suscripción y Pagos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Evenza ofrece diferentes planes de suscripción mensual o anual. Al suscribirte a un plan de pago:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Autorizas el cobro recurrente según el plan seleccionado</li>
              <li>Los precios están sujetos a cambios con previo aviso de 30 días</li>
              <li>Las renovaciones son automáticas a menos que canceles tu suscripción</li>
              <li>No se proporcionan reembolsos por cancelaciones anticipadas</li>
              <li>El acceso al Servicio puede ser suspendido por falta de pago</li>
            </ul>
          </section>

          {/* User Data and Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Datos del Usuario</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mantienes todos los derechos sobre los datos que ingresas en Evenza. Al utilizar nuestro Servicio:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Nos otorgas una licencia limitada para procesar tus datos con el fin de proporcionar el Servicio</li>
              <li>Eres responsable de la precisión y legalidad de los datos que ingresas</li>
              <li>Garantizas que tienes derecho a compartir toda la información que proporcionas</li>
              <li>Puedes exportar tus datos en cualquier momento</li>
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Usos Prohibidos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al utilizar Evenza, aceptas NO:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Violar leyes o regulaciones aplicables</li>
              <li>Compartir tu cuenta con terceros no autorizados</li>
              <li>Intentar acceder a datos de otros usuarios</li>
              <li>Realizar ingeniería inversa o copiar el software</li>
              <li>Usar el Servicio para actividades fraudulentas o ilegales</li>
              <li>Sobrecargar o interferir con la infraestructura del Servicio</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Evenza y todo su contenido, características y funcionalidad son propiedad exclusiva de Evenza y están protegidos por derechos de autor, marcas registradas y otras leyes de propiedad intelectual.
            </p>
            <p className="text-gray-700 leading-relaxed">
              No se te otorga ningún derecho o licencia sobre nuestras marcas, logotipos o contenido, excepto el uso limitado necesario para acceder al Servicio.
            </p>
          </section>

          {/* Service Availability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disponibilidad del Servicio</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nos esforzamos por mantener Evenza disponible 24/7, sin embargo:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>No garantizamos un tiempo de actividad del 100%</li>
              <li>Podemos realizar mantenimiento programado con previo aviso</li>
              <li>No somos responsables por interrupciones fuera de nuestro control</li>
              <li>Podemos modificar o descontinuar características con previo aviso</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En la medida máxima permitida por la ley, Evenza no será responsable por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Pérdida de datos, beneficios o ingresos</li>
              <li>Daños indirectos, incidentales o consecuentes</li>
              <li>Interrupciones del servicio o errores de software</li>
              <li>Acciones de terceros o enlaces externos</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nuestra responsabilidad total no excederá el monto pagado por tu suscripción en los últimos 12 meses.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Terminación</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puedes cancelar tu cuenta en cualquier momento desde la configuración. Nos reservamos el derecho de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Suspender o terminar tu acceso por violación de estos Términos</li>
              <li>Eliminar tu cuenta por inactividad prolongada (más de 12 meses)</li>
              <li>Discontinuar el Servicio con 90 días de aviso</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Tras la terminación, tendrás 30 días para exportar tus datos antes de su eliminación permanente.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modificaciones a los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar estos Términos ocasionalmente. Te notificaremos sobre cambios materiales por correo electrónico o mediante un aviso en el Servicio. El uso continuado del Servicio después de los cambios constituye tu aceptación de los nuevos Términos.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Ley Aplicable</h2>
            <p className="text-gray-700 leading-relaxed">
              Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa se resolverá en los tribunales competentes de la Ciudad de México.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Si tienes preguntas sobre estos Términos, contáctanos en:
            </p>
            <p className="text-purple-600 font-medium">
              soporte@evenza.mx
            </p>
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
              <Link href="/terms" className="hover:text-purple-600 transition-colors font-medium">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
