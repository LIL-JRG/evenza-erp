/**
 * Utilidades para manejar paquetes en facturas y eventos
 */

import type { Product, PackageItem } from '@/types/improved-types'

export interface InvoiceItemWithPackage {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  is_package: boolean
  package_items?: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
  }>
}

/**
 * Expande un item de paquete para mostrar sus componentes
 * Usado para mostrar el desglose en facturas
 */
export function expandPackageItem(
  packageProduct: Product,
  packageQuantity: number,
  componentProducts: Product[]
): InvoiceItemWithPackage {
  if (packageProduct.type !== 'package' || !packageProduct.package_items) {
    // Si no es un paquete, retornar como item normal
    return {
      product_id: packageProduct.id,
      product_name: packageProduct.name,
      quantity: packageQuantity,
      unit_price: packageProduct.price,
      subtotal: packageProduct.price * packageQuantity,
      is_package: false,
    }
  }

  // Calcular precio del paquete
  let packagePrice = packageProduct.price
  if (packageProduct.pricing_strategy === 'calculated') {
    packagePrice = 0
    for (const item of packageProduct.package_items) {
      const component = componentProducts.find(p => p.id === item.product_id)
      if (component) {
        packagePrice += component.price * item.quantity
      }
    }
  }

  // Expandir items del paquete
  const expandedItems = packageProduct.package_items.map(item => {
    const component = componentProducts.find(p => p.id === item.product_id)
    return {
      product_id: item.product_id,
      product_name: component?.name || 'Producto desconocido',
      quantity: item.quantity * packageQuantity,
      unit_price: component?.price || 0,
    }
  })

  return {
    product_id: packageProduct.id,
    product_name: packageProduct.name,
    quantity: packageQuantity,
    unit_price: packagePrice,
    subtotal: packagePrice * packageQuantity,
    is_package: true,
    package_items: expandedItems,
  }
}

/**
 * Expande todos los paquetes en una lista de items de factura
 */
export function expandAllPackageItems(
  items: Array<{
    product_id: string
    quantity: number
  }>,
  allProducts: Product[]
): InvoiceItemWithPackage[] {
  return items.map(item => {
    const product = allProducts.find(p => p.id === item.product_id)
    if (!product) {
      return {
        product_id: item.product_id,
        product_name: 'Producto no encontrado',
        quantity: item.quantity,
        unit_price: 0,
        subtotal: 0,
        is_package: false,
      }
    }

    if (product.type === 'package') {
      // Es un paquete, expandir
      const componentProducts = allProducts.filter(p =>
        product.package_items?.some(pi => pi.product_id === p.id)
      )
      return expandPackageItem(product, item.quantity, componentProducts)
    }

    // Es un producto normal
    return {
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: product.price,
      subtotal: product.price * item.quantity,
      is_package: false,
    }
  })
}

/**
 * Calcula el precio de un producto (considerando si es paquete con precio calculado)
 */
export function getProductPrice(
  product: Product,
  allProducts?: Product[]
): number {
  if (product.type !== 'package') {
    return product.price
  }

  if (product.pricing_strategy === 'fixed') {
    return product.price
  }

  // Pricing strategy es 'calculated'
  if (!product.package_items || !allProducts) {
    return product.price
  }

  let total = 0
  for (const item of product.package_items) {
    const component = allProducts.find(p => p.id === item.product_id)
    if (component) {
      total += component.price * item.quantity
    }
  }

  return total
}

/**
 * Formatea un paquete para mostrar en UI
 */
export function formatPackageForDisplay(
  product: Product,
  componentProducts?: Product[]
): {
  name: string
  price: number
  priceLabel: string
  itemCount: number
  items: Array<{
    name: string
    quantity: number
  }>
} {
  if (product.type !== 'package') {
    return {
      name: product.name,
      price: product.price,
      priceLabel: 'Precio',
      itemCount: 1,
      items: [],
    }
  }

  const price = getProductPrice(product, componentProducts)
  const priceLabel = product.pricing_strategy === 'fixed'
    ? 'Precio fijo'
    : 'Precio calculado'

  const items = (product.package_items || []).map(item => {
    const component = componentProducts?.find(p => p.id === item.product_id)
    return {
      name: component?.name || 'Producto desconocido',
      quantity: item.quantity,
    }
  })

  return {
    name: product.name,
    price,
    priceLabel,
    itemCount: product.package_items?.length || 0,
    items,
  }
}
