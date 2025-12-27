'use server'

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type {
  Product,
  CreatePackageInput,
  UpdatePackageInput,
  PackageStockAvailability,
  PackageStockDeduction,
} from '@/types/improved-types'

async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  )
}

// =====================================================
// CREAR PAQUETE
// =====================================================

export async function createPackage(input: CreatePackageInput) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Validar que tenga al menos 2 productos
  if (!input.package_items || input.package_items.length < 2) {
    throw new Error('Un paquete debe contener al menos 2 productos')
  }

  // Validar que los productos existan y sean de tipo 'product'
  const productIds = input.package_items.map(item => item.product_id)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, type, name')
    .in('id', productIds)
    .eq('user_id', user.id)

  if (productsError) {
    console.error('Error fetching products:', productsError)
    throw new Error('Error al verificar productos')
  }

  // Verificar que todos los productos existan
  if (!products || products.length !== productIds.length) {
    throw new Error('Uno o más productos no existen')
  }

  // Verificar que ninguno sea un paquete (no se pueden anidar paquetes)
  const hasPackages = products.some(p => p.type === 'package')
  if (hasPackages) {
    throw new Error('No se pueden incluir paquetes dentro de otros paquetes')
  }

  // Crear el paquete
  const { data: newPackage, error: createError } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      type: 'package',
      name: input.name,
      sku: input.sku || null,
      description: input.description || null,
      package_description: input.package_description || null,
      price: input.price,
      stock: input.stock,
      category: input.category || null,
      image_url: input.image_url || null,
      pricing_strategy: input.pricing_strategy,
      package_items: input.package_items,
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating package:', createError)
    throw new Error('Error al crear paquete')
  }

  revalidatePath('/dashboard/productos')

  return newPackage as Product
}

// =====================================================
// ACTUALIZAR PAQUETE
// =====================================================

export async function updatePackage(
  packageId: string,
  input: UpdatePackageInput
) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verificar que el producto sea un paquete
  const { data: existingPackage, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', packageId)
    .eq('user_id', user.id)
    .eq('type', 'package')
    .single()

  if (fetchError || !existingPackage) {
    throw new Error('Paquete no encontrado')
  }

  // Si se actualizan los items, validar
  if (input.package_items) {
    if (input.package_items.length < 2) {
      throw new Error('Un paquete debe contener al menos 2 productos')
    }

    // Validar que los productos existan
    const productIds = input.package_items.map(item => item.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('id, type')
      .in('id', productIds)
      .eq('user_id', user.id)

    if (!products || products.length !== productIds.length) {
      throw new Error('Uno o más productos no existen')
    }

    const hasPackages = products.some(p => p.type === 'package')
    if (hasPackages) {
      throw new Error('No se pueden incluir paquetes dentro de otros paquetes')
    }
  }

  // Actualizar
  const { data: updatedPackage, error: updateError } = await supabase
    .from('products')
    .update(input)
    .eq('id', packageId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating package:', updateError)
    throw new Error('Error al actualizar paquete')
  }

  revalidatePath('/dashboard/productos')

  return updatedPackage as Product
}

// =====================================================
// OBTENER PAQUETES
// =====================================================

export async function getPackages() {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'package')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching packages:', error)
    throw new Error('Error al obtener paquetes')
  }

  return data as Product[]
}

// =====================================================
// OBTENER PAQUETE POR ID
// =====================================================

export async function getPackageById(packageId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', packageId)
    .eq('user_id', user.id)
    .eq('type', 'package')
    .single()

  if (error) {
    console.error('Error fetching package:', error)
    throw new Error('Error al obtener paquete')
  }

  return data as Product
}

// =====================================================
// OBTENER PAQUETE CON PRODUCTOS INCLUIDOS (DESGLOSADO)
// =====================================================

export async function getPackageWithItems(packageId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Obtener el paquete
  const packageData = await getPackageById(packageId)

  if (!packageData.package_items || packageData.package_items.length === 0) {
    return {
      package: packageData,
      items: [],
    }
  }

  // Obtener los productos incluidos
  const productIds = packageData.package_items.map(item => item.product_id)
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching package items:', error)
    throw new Error('Error al obtener productos del paquete')
  }

  // Combinar productos con cantidades
  const items = packageData.package_items.map(item => {
    const product = products?.find(p => p.id === item.product_id)
    return {
      ...product,
      quantity: item.quantity,
    }
  })

  return {
    package: packageData,
    items,
  }
}

// =====================================================
// CALCULAR PRECIO DE PAQUETE
// =====================================================

export async function calculatePackagePrice(packageId: string): Promise<number> {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('calculate_package_price', {
    p_package_id: packageId,
  })

  if (error) {
    console.error('Error calculating package price:', error)
    throw new Error('Error al calcular precio del paquete')
  }

  return data as number
}

// =====================================================
// VERIFICAR DISPONIBILIDAD DE STOCK DE PAQUETE
// =====================================================

export async function checkPackageStockAvailability(
  packageId: string,
  quantity: number
): Promise<PackageStockAvailability> {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('check_package_stock_availability', {
    p_package_id: packageId,
    p_quantity: quantity,
  })

  if (error) {
    console.error('Error checking package availability:', error)
    throw new Error('Error al verificar disponibilidad del paquete')
  }

  return data as PackageStockAvailability
}

// =====================================================
// DESCONTAR STOCK DE PAQUETE
// =====================================================

export async function deductPackageStock(
  packageId: string,
  quantity: number
): Promise<PackageStockDeduction> {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('deduct_package_stock', {
    p_package_id: packageId,
    p_quantity: quantity,
  })

  if (error) {
    console.error('Error deducting package stock:', error)
    throw new Error('Error al descontar stock del paquete')
  }

  const result = data as PackageStockDeduction

  if (!result.success) {
    throw new Error(result.error || 'Error al descontar stock')
  }

  revalidatePath('/dashboard/productos')

  return result
}

// =====================================================
// RESTAURAR STOCK DE PAQUETE (Al cancelar venta)
// =====================================================

export async function restorePackageStock(
  packageId: string,
  quantity: number
): Promise<PackageStockDeduction> {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('restore_package_stock', {
    p_package_id: packageId,
    p_quantity: quantity,
  })

  if (error) {
    console.error('Error restoring package stock:', error)
    throw new Error('Error al restaurar stock del paquete')
  }

  revalidatePath('/dashboard/productos')

  return data as PackageStockDeduction
}

// =====================================================
// ELIMINAR PAQUETE
// =====================================================

export async function deletePackage(packageId: string) {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Verificar que no esté en uso en cotizaciones/ventas activas
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id')
    .contains('items', [{ product_id: packageId }])
    .neq('status', 'cancelled')
    .limit(1)

  if (invoices && invoices.length > 0) {
    throw new Error('No se puede eliminar un paquete que está en uso en cotizaciones o ventas activas')
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', packageId)
    .eq('user_id', user.id)
    .eq('type', 'package')

  if (error) {
    console.error('Error deleting package:', error)
    throw new Error('Error al eliminar paquete')
  }

  revalidatePath('/dashboard/productos')

  return { success: true }
}
