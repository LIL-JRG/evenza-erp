export function FeatureCards() {
  const features = [
    {
      title: "Gestión de Clientes",
      description: "Administra contratos de renta,\ndatos y documentos en un dashboard intuitivo.",
      highlighted: true,
    },
    {
      title: "Calendario y Eventos",
      description: "Planifica entregas, eventos\ny mantenimiento en tiempo real.",
      highlighted: false,
    },
    {
      title: "Cotizaciones y Análisis",
      description: "Genera cotizaciones profesionales\ny analiza el desempeño del negocio.",
      highlighted: false,
    },
  ]

  return (
    <section className="border-t border-[#d1dce8] border-b border-[#d1dce8]">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 flex flex-col gap-2 ${
                feature.highlighted ? "bg-white border border-[#d1dce8] shadow-sm" : "border border-[#d1dce8]/80"
              }`}
            >
              {feature.highlighted && (
                <div className="space-y-1 mb-2">
                  <div className="w-full h-0.5 bg-[rgba(31,58,82,0.08)]"></div>
                  <div className="w-32 h-0.5 bg-[#1f3a52]"></div>
                </div>
              )}
              <h3 className="text-[#1f3a52] text-sm font-semibold leading-6">{feature.title}</h3>
              <p className="text-[#5a7a8f] text-sm leading-[22px] whitespace-pre-line">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
