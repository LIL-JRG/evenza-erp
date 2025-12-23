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
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

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
