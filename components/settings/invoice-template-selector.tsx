'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Check } from 'lucide-react'
import { type SubscriptionTier, hasFeature } from '@/lib/plan-limits'
import { type InvoiceTemplate } from '@/components/invoices/invoice-document'
import { cn } from '@/lib/utils'

interface TemplateOption {
  id: InvoiceTemplate
  name: string
  description: string
  preview: string
  colorScheme: string
  isPremium: boolean
  featureKey?: 'simple_invoice_template' | 'colorful_invoice_template' | 'modern_invoice_template' | 'elegant_invoice_template' | 'professional_invoice_template'
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'simple',
    name: 'Simple',
    description: 'Plantilla básica en blanco y negro',
    preview: 'bg-white border-2 border-black',
    colorScheme: 'Blanco y Negro',
    isPremium: false,
    featureKey: 'simple_invoice_template'
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Plantilla moderna con colores vibrantes',
    preview: 'bg-gradient-to-br from-purple-100 to-pink-100',
    colorScheme: 'Morado y Rosa',
    isPremium: true,
    featureKey: 'colorful_invoice_template'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Diseño contemporáneo con gradientes azules',
    preview: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    colorScheme: 'Azul y Cyan',
    isPremium: true,
    featureKey: 'modern_invoice_template'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Estilo elegante con tonos dorados',
    preview: 'bg-gradient-to-br from-amber-50 to-amber-100',
    colorScheme: 'Dorado y Beige',
    isPremium: true,
    featureKey: 'elegant_invoice_template'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Diseño corporativo con azul marino',
    preview: 'bg-gradient-to-br from-slate-100 to-slate-200',
    colorScheme: 'Gris y Azul Marino',
    isPremium: true,
    featureKey: 'professional_invoice_template'
  }
]

interface InvoiceTemplateSelectorProps {
  subscriptionTier: SubscriptionTier
  selectedTemplate: InvoiceTemplate
  onSelectTemplate: (template: InvoiceTemplate) => void
  onUpgrade: () => void
}

export function InvoiceTemplateSelector({
  subscriptionTier,
  selectedTemplate,
  onSelectTemplate,
  onUpgrade
}: InvoiceTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Plantillas de Cotización</h3>
        <p className="text-sm text-muted-foreground">
          Selecciona el diseño que se utilizará en tus cotizaciones y notas de venta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((template) => {
          const isLocked = template.isPremium && !hasFeature(subscriptionTier, template.featureKey!)
          const isSelected = selectedTemplate === template.id

          return (
            <Card
              key={template.id}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-200",
                isSelected && "ring-2 ring-purple-600 shadow-lg",
                isLocked && "opacity-60",
                !isLocked && "hover:shadow-lg hover:scale-[1.02]"
              )}
              style={{
                backgroundColor: '#ECF0F3',
                boxShadow: isSelected
                  ? '6px 6px 12px #D1D9E6, -6px -6px 12px #FFFFFF'
                  : '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
              }}
              onClick={() => {
                if (isLocked) {
                  onUpgrade()
                } else {
                  onSelectTemplate(template.id)
                }
              }}
            >
              <div className="p-4">
                {/* Preview */}
                <div className={cn(
                  "w-full h-32 rounded-lg mb-3 flex items-center justify-center relative",
                  template.preview
                )}>
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center">
                      <div
                        className="rounded-full p-3"
                        style={{
                          backgroundColor: '#ECF0F3',
                          boxShadow: '4px 4px 8px #D1D9E6, -4px -4px 8px #FFFFFF'
                        }}
                      >
                        <Lock className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  )}
                  {isSelected && !isLocked && (
                    <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="text-xs text-gray-500 opacity-50 select-none">
                    Vista previa
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{template.name}</h4>
                    {template.isPremium && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs"
                      >
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Colores:</span> {template.colorScheme}
                  </p>
                </div>

                {/* Locked overlay message */}
                {isLocked && (
                  <div className="mt-3 text-xs text-center text-purple-600 font-medium">
                    Actualiza tu plan para desbloquear
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {subscriptionTier === 'free' && (
        <div
          className="p-4 rounded-xl text-sm text-muted-foreground text-center"
          style={{
            backgroundColor: '#ECF0F3',
            boxShadow: 'inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF'
          }}
        >
          <p className="font-medium text-foreground mb-1">
            ¿Quieres más opciones de diseño?
          </p>
          <p>
            Actualiza a <span className="font-semibold">Starter</span> o{' '}
            <span className="font-semibold">Professional</span> para acceder a todas las plantillas premium
          </p>
        </div>
      )}
    </div>
  )
}
