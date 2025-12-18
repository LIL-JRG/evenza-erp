import type React from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header
      className="w-full border-b"
      style={{ borderColor: "var(--brand-border)", backgroundColor: "var(--brand-surface-lighter)" }}
    >
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <div className="text-lg font-semibold" style={{ color: "var(--brand-text-default)" }}>
              Evenza
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--brand-text-default)" }}
              >
                Funcionalidades
              </button>
              <button
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--brand-text-default)" }}
              >
                Planes
              </button>
              <button
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--brand-text-default)" }}
              >
                Clientes
              </button>
            </div>
          </div>
          <Button
            variant="ghost"
            className="transition-colors"
            style={{ color: "var(--brand-text-default)", "--tw-bg-opacity": "5%" } as React.CSSProperties}
          >
            Ingresar
          </Button>
        </nav>
      </div>
    </header>
  )
}
