'use client'

import { Package, DollarSign, BoxIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types/improved-types'

interface PackageCardProps {
  packageProduct: Product
  componentProducts?: Product[]
  onClick?: () => void
}

export function PackageCard({ packageProduct, componentProducts = [], onClick }: PackageCardProps) {
  if (packageProduct.type !== 'package') {
    return null
  }

  // Calcular precio si es 'calculated'
  let displayPrice = packageProduct.price
  if (packageProduct.pricing_strategy === 'calculated' && packageProduct.package_items) {
    displayPrice = 0
    packageProduct.package_items.forEach(item => {
      const component = componentProducts.find(p => p.id === item.product_id)
      if (component) {
        displayPrice += component.price * item.quantity
      }
    })
  }

  const itemCount = packageProduct.package_items?.length || 0

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle className="text-lg">{packageProduct.name}</CardTitle>
              {packageProduct.sku && (
                <CardDescription className="text-xs">{packageProduct.sku}</CardDescription>
              )}
            </div>
          </div>
          <Badge variant="secondary">
            {packageProduct.pricing_strategy === 'fixed' ? 'Precio fijo' : 'Calculado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {packageProduct.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {packageProduct.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <BoxIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
            {displayPrice.toFixed(2)}
          </div>
        </div>

        {/* Lista de productos incluidos */}
        {packageProduct.package_items && packageProduct.package_items.length > 0 && (
          <div className="border-t pt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Incluye:</p>
            {packageProduct.package_items.slice(0, 3).map((item, index) => {
              const component = componentProducts.find(p => p.id === item.product_id)
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {component?.name || 'Producto'} × {item.quantity}
                  </span>
                  {component && (
                    <span className="text-muted-foreground">
                      ${(component.price * item.quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              )
            })}
            {packageProduct.package_items.length > 3 && (
              <p className="text-xs text-muted-foreground italic">
                +{packageProduct.package_items.length - 3} más...
              </p>
            )}
          </div>
        )}

        {/* Stock */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">Stock disponible:</span>
          <Badge variant={packageProduct.stock > 0 ? 'default' : 'destructive'}>
            {packageProduct.stock} {packageProduct.stock === 1 ? 'paquete' : 'paquetes'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
