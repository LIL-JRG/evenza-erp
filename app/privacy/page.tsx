import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="border-b border-purple-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/evenza/logo_evenza_sf.png" alt="Evenza" className="h-8 w-auto" />
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
            Política de Privacidad
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
              En Evenza, nos tomamos muy en serio la privacidad de tus datos. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas nuestra plataforma.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Al utilizar Evenza, aceptas las prácticas descritas en esta política. Si no estás de acuerdo, por favor no utilices nuestro servicio.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Información de Cuenta</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cuando creas una cuenta en Evenza, recopilamos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Contraseña (encriptada)</li>
              <li>Nombre de la empresa</li>
              <li>Información de facturación y pago</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Datos de Uso</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Recopilamos información sobre cómo utilizas Evenza:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Páginas visitadas y funciones utilizadas</li>
              <li>Fecha y hora de acceso</li>
              <li>Dirección IP y ubicación aproximada</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Sistema operativo</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Datos de Negocio</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Los datos que ingresas en la plataforma para gestionar tu negocio:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Información de clientes (nombres, contactos, direcciones)</li>
              <li>Detalles de eventos y contratos</li>
              <li>Inventario de productos y mobiliario</li>
              <li>Cotizaciones y recibos</li>
              <li>Cualquier otra información que elijas almacenar en Evenza</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Utilizamos tu Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos tu información para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Proporcionar y mantener el servicio de Evenza</li>
              <li>Procesar pagos y gestionar suscripciones</li>
              <li>Enviarte notificaciones importantes sobre tu cuenta</li>
              <li>Proporcionar soporte técnico</li>
              <li>Mejorar y personalizar tu experiencia</li>
              <li>Analizar el uso del servicio para mejoras y optimizaciones</li>
              <li>Detectar, prevenir y abordar problemas técnicos o de seguridad</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          {/* Marketing Communications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Comunicaciones de Marketing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Con tu consentimiento, podemos enviarte:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Actualizaciones sobre nuevas funciones</li>
              <li>Consejos y mejores prácticas para usar Evenza</li>
              <li>Promociones especiales y ofertas</li>
              <li>Encuestas de satisfacción</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Puedes cancelar la suscripción a estos correos en cualquier momento haciendo clic en el enlace de cancelación en cualquier email o desde la configuración de tu cuenta.
            </p>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compartir Información</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              No vendemos ni alquilamos tu información personal a terceros. Podemos compartir tu información únicamente en las siguientes circunstancias:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Proveedores de Servicios</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Compartimos datos con proveedores que nos ayudan a operar Evenza:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Proveedores de hosting (Vercel, Supabase)</li>
              <li>Procesadores de pago (Stripe)</li>
              <li>Servicios de análisis</li>
              <li>Proveedores de email</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Todos estos proveedores están obligados contractualmente a proteger tu información y solo pueden usarla para proporcionar servicios a Evenza.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Cumplimiento Legal</h3>
            <p className="text-gray-700 leading-relaxed">
              Podemos divulgar tu información si es requerido por ley, orden judicial, o para proteger nuestros derechos legales o la seguridad de nuestros usuarios.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Transferencia de Negocio</h3>
            <p className="text-gray-700 leading-relaxed">
              En caso de fusión, adquisición o venta de activos, tu información puede ser transferida. Te notificaremos antes de que tu información se transfiera y esté sujeta a una política de privacidad diferente.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seguridad de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
              <li>Encriptación de datos en reposo</li>
              <li>Contraseñas hasheadas con algoritmos seguros</li>
              <li>Controles de acceso estrictos</li>
              <li>Backups regulares y automatizados</li>
              <li>Monitoreo de seguridad continuo</li>
              <li>Auditorías de seguridad periódicas</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por proteger tu información, no podemos garantizar su seguridad absoluta.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Retenemos tu información personal mientras:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantengas una cuenta activa con Evenza</li>
              <li>Sea necesario para proporcionarte el servicio</li>
              <li>Sea requerido por obligaciones legales, fiscales o contables</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Cuando canceles tu cuenta, eliminaremos o anonimizaremos tu información personal dentro de 30 días, excepto donde estemos legalmente obligados a retenerla por más tiempo.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Tus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tienes los siguientes derechos respecto a tu información personal:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Acceso:</strong> Solicitar una copia de los datos que tenemos sobre ti</li>
              <li><strong>Corrección:</strong> Actualizar o corregir información inexacta</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de tu información (derecho al olvido)</li>
              <li><strong>Portabilidad:</strong> Exportar tus datos en un formato estructurado y legible</li>
              <li><strong>Restricción:</strong> Solicitar que limitemos el procesamiento de tus datos</li>
              <li><strong>Objeción:</strong> Oponerte a ciertos usos de tu información</li>
              <li><strong>Revocación:</strong> Retirar el consentimiento en cualquier momento</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para ejercer cualquiera de estos derechos, contáctanos en <span className="text-purple-600 font-medium">privacidad@evenza.mx</span>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del servicio (inicio de sesión, seguridad)</li>
              <li><strong>Cookies de rendimiento:</strong> Analizar cómo se utiliza Evenza para mejorar la experiencia</li>
              <li><strong>Cookies de preferencias:</strong> Recordar tus configuraciones y preferencias</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Puedes controlar las cookies a través de la configuración de tu navegador, pero ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad de Evenza.
            </p>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Transferencias Internacionales</h2>
            <p className="text-gray-700 leading-relaxed">
              Tus datos pueden ser almacenados y procesados en servidores ubicados fuera de México. Nos aseguramos de que cualquier transferencia internacional de datos cumpla con las leyes aplicables de protección de datos y que tus datos reciban un nivel adecuado de protección.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Privacidad de Menores</h2>
            <p className="text-gray-700 leading-relaxed">
              Evenza no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios materiales por correo electrónico o mediante un aviso destacado en Evenza. La fecha de &quot;Última actualización&quot; al inicio de esta política refleja cuándo fue modificada por última vez.
            </p>
          </section>

          {/* GDPR/LFPDPPP Compliance */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Cumplimiento Normativo</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Evenza cumple con:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP) de México</li>
              <li>Reglamento General de Protección de Datos (GDPR) de la Unión Europea, cuando sea aplicable</li>
              <li>Otras leyes de privacidad aplicables según la ubicación de nuestros usuarios</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tienes preguntas, inquietudes o deseas ejercer tus derechos de privacidad, contáctanos:
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-4">
              <p className="text-gray-700 mb-2">
                <strong>Email de Privacidad:</strong> <span className="text-purple-600">privacidad@evenza.mx</span>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email de Soporte:</strong> <span className="text-purple-600">soporte@evenza.mx</span>
              </p>
              <p className="text-gray-700">
                Nos comprometemos a responder a tus solicitudes dentro de 30 días hábiles.
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
              <Link href="/privacy" className="hover:text-purple-600 transition-colors font-medium">
                Privacidad
              </Link>
              <Link href="/terms" className="hover:text-purple-600 transition-colors">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
