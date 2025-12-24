"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mapeo de rutas a nombres en español
const routeNames: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/clientes": "Clientes",
  "/dashboard/configuracion": "Configuración",
  "/dashboard/calendario": "Calendario",
  "/dashboard/productos": "Productos",
  "/dashboard/eventos": "Eventos",
  "/dashboard/recibos": "Recibos",
  "/dashboard/contracts": "Contratos",
  "/dashboard/maintenance": "Mantenimiento",
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  // Detectar rutas dinámicas
  const pathSegments = pathname.split("/").filter(Boolean)

  // Caso especial: rutas de detalle de recibos
  if (pathSegments.length === 3 && pathSegments[1] === "recibos") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">
              Panel
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/recibos">
              Recibos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ver Recibo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Caso especial: rutas de detalle de eventos
  if (pathSegments.length === 3 && pathSegments[1] === "eventos") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">
              Panel
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/eventos">
              Eventos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ver Evento</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Obtener el nombre de la página actual
  const currentPageName = routeNames[pathname] || "Inicio"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">
            Panel
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
