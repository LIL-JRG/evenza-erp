# 📦 Sistema de Paquetes - Documentación Completa

## 🎯 Descripción General

El sistema de paquetes permite crear conjuntos predefinidos de productos que se venden/rentan como una unidad. Ideal para eventos comunes como bodas, cumpleaños, etc.

---

## ✨ Características Principales

### **1. Flexibilidad de Precios**
- **Precio Fijo**: Define un precio personalizado (ej: Paquete Boda = $5,000)
- **Precio Calculado**: Se suma automáticamente el precio de todos los productos incluidos

### **2. Stock Independiente**
- Los paquetes tienen su propio stock separado de productos individuales
- Útil para paquetes pre-armados que tienes listos en almacén

### **3. Deducción Automática**
- Al vender/rentar un paquete, se descuenta:
  - Stock del paquete (-1 paquete)
  - Stock de cada producto incluido (según cantidades definidas)

### **4. Visualización Desglosada**
- En cotizaciones y facturas, los paquetes se muestran con todos sus componentes
- El cliente ve exactamente qué incluye el paquete

---

## 📋 Conceptos Clave

### **Producto vs Paquete**

**Producto Individual:**
```typescript
{
  type: 'product',
  name: 'Silla Tiffany',
  price: 50,
  stock: 100
}
```

**Paquete:**
```typescript
{
  type: 'package',
  name: 'Paquete Boda 50 Personas',
  price: 3500,  // Precio fijo
  pricing_strategy: 'fixed',
  stock: 5,  // 5 paquetes armados
  package_items: [
    { product_id: 'uuid-silla', quantity: 50 },
    { product_id: 'uuid-mesa', quantity: 5 },
    { product_id: 'uuid-mantel', quantity: 5 }
  ]
}
```

---

## 🚀 Implementación

### **Paso 1: Aplicar Migración en Supabase**

```sql
-- Ejecuta el archivo:
-- supabase/migrations/002_add_packages_system.sql
```

Esto creará:
- ✅ Nuevas columnas en `products`
- ✅ Funciones SQL para manejo de paquetes
- ✅ Índices de búsqueda

### **Paso 2: Verificar Migración**

```sql
-- Verificar que las columnas existen
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('type', 'package_items', 'pricing_strategy');

-- Verificar funciones
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN (
  'calculate_package_price',
  'check_package_stock_availability',
  'deduct_package_stock',
  'restore_package_stock'
);
```

---

## 📝 Uso del Sistema

### **A. Crear un Paquete**

```typescript
import { createPackage } from '@/app/dashboard/productos/package-actions'

const newPackage = await createPackage({
  name: 'Paquete Boda 50 Personas',
  sku: 'PACK-BODA-50',
  description: 'Paquete completo para boda de 50 personas',
  package_description: 'Incluye todo el mobiliario necesario para 50 invitados',
  price: 3500,
  stock: 5,
  category: 'Bodas',
  pricing_strategy: 'fixed',  // o 'calculated'
  package_items: [
    { product_id: 'uuid-silla-tiffany', quantity: 50 },
    { product_id: 'uuid-mesa-redonda', quantity: 5 },
    { product_id: 'uuid-mantel-blanco', quantity: 5 },
  ]
})
```

### **B. Verificar Disponibilidad**

```typescript
import { checkPackageStockAvailability } from '@/app/dashboard/productos/package-actions'

const availability = await checkPackageStockAvailability(
  'uuid-del-paquete',
  2  // Quiero 2 paquetes
)

console.log(availability)
// {
//   available: false,
//   details: [
//     {
//       product_id: 'uuid-silla',
//       product_name: 'Silla Tiffany',
//       required: 100,  // 50 por paquete × 2
//       available: 80,
//       sufficient: false
//     },
//     // ...
//   ]
// }

if (!availability.available) {
  alert('No hay suficiente stock para algunos productos del paquete')
  // Mostrar detalles de qué falta
}
```

### **C. Agregar Paquete a Cotización**

Los paquetes se agregan igual que productos normales:

```typescript
import { createInvoice } from '@/app/dashboard/recibos/actions'

const invoice = await createInvoice({
  customer_id: 'uuid-cliente',
  event_id: 'uuid-evento',
  type: 'quote',
  items: [
    {
      product_id: 'uuid-paquete-boda',  // ID del paquete
      product_name: 'Paquete Boda 50 Personas',
      quantity: 1,
      unit_price: 3500,
      subtotal: 3500
    }
  ],
  discount: 0,
})
```

### **D. Convertir a Venta (con descuento automático)**

```typescript
import { convertQuoteToSaleImproved } from '@/app/dashboard/recibos/payment-actions'

// Al convertir a venta, automáticamente se descuenta:
// - Stock del paquete (-1)
// - Stock de productos incluidos (-50 sillas, -5 mesas, -5 manteles)

const sale = await convertQuoteToSaleImproved('uuid-cotizacion', {
  depositAmount: 2000,
  paymentMethod: 'transfer',
  generateContract: true
})
```

### **E. Calcular Precio de Paquete**

```typescript
import { calculatePackagePrice } from '@/app/dashboard/productos/package-actions'

// Solo necesario si pricing_strategy es 'calculated'
const price = await calculatePackagePrice('uuid-paquete')
console.log(`Precio calculado: $${price}`)
```

---

## 🎨 Componentes UI

### **Crear Paquete**

```tsx
import { CreatePackageDialog } from '@/components/products/create-package-dialog'

<CreatePackageDialog
  products={allProducts}  // Pasa todos los productos
  onSuccess={() => {
    // Recargar lista
  }}
/>
```

### **Mostrar Paquete**

```tsx
import { PackageCard } from '@/components/products/package-card'

<PackageCard
  packageProduct={package}
  componentProducts={products}
  onClick={() => {
    // Ver detalles
  }}
/>
```

### **Expandir Paquete en Factura**

```typescript
import { expandAllPackageItems } from '@/lib/package-utils'

const items = [
  { product_id: 'uuid-paquete', quantity: 2 }
]

const expandedItems = expandAllPackageItems(items, allProducts)

// Resultado:
// [
//   {
//     product_id: 'uuid-paquete',
//     product_name: 'Paquete Boda',
//     quantity: 2,
//     unit_price: 3500,
//     subtotal: 7000,
//     is_package: true,
//     package_items: [
//       { product_name: 'Silla Tiffany', quantity: 100, unit_price: 50 },
//       { product_name: 'Mesa Redonda', quantity: 10, unit_price: 200 },
//       // ...
//     ]
//   }
// ]
```

---

## 🔄 Flujos de Trabajo

### **Flujo: Crear y Vender un Paquete**

```
1. CREAR PAQUETE
   ↓
2. Usuario crea paquete "Boda 50 Personas"
   - Selecciona productos incluidos
   - Define cantidades
   - Elige precio fijo o calculado
   - Define stock de paquetes
   ↓
3. CREAR COTIZACIÓN
   ↓
4. Usuario agrega paquete a cotización
   - Se verifica disponibilidad de todos los componentes
   - Se muestra desglose al cliente
   ↓
5. CONVERTIR A VENTA
   ↓
6. Sistema descuenta automáticamente:
   - Stock del paquete: 5 → 4
   - Stock de sillas: 100 → 50
   - Stock de mesas: 20 → 15
   - Stock de manteles: 50 → 45
   ↓
7. FACTURA GENERADA ✅
```

### **Flujo: Verificar Disponibilidad**

```
Usuario quiere 3 paquetes "Boda 50 Personas"
   ↓
Sistema verifica:
   - Paquetes disponibles: 5 ✅ (suficiente)
   - Sillas necesarias: 150 (50 × 3)
     Stock actual: 120 ❌ (insuficiente)
   - Mesas necesarias: 15 (5 × 3)
     Stock actual: 20 ✅ (suficiente)
   ↓
Resultado: NO DISPONIBLE
Razón: Faltan 30 sillas
   ↓
Usuario puede:
   - Reducir cantidad de paquetes
   - Comprar/rentar más sillas
   - Ofrecer paquete alternativo
```

---

## 📊 Funciones SQL Disponibles

### **1. calculate_package_price()**

```sql
-- Calcula el precio de un paquete sumando sus componentes
SELECT calculate_package_price('uuid-del-paquete');
-- Retorna: 3500.00
```

### **2. check_package_stock_availability()**

```sql
-- Verifica si hay suficiente stock de todos los componentes
SELECT check_package_stock_availability('uuid-del-paquete', 2);
-- Retorna: JSON con disponibilidad y detalles
```

### **3. deduct_package_stock()**

```sql
-- Descuenta stock del paquete y sus componentes
SELECT deduct_package_stock('uuid-del-paquete', 1);
-- Retorna: JSON con items descontados
```

### **4. restore_package_stock()**

```sql
-- Restaura stock (al cancelar venta)
SELECT restore_package_stock('uuid-del-paquete', 1);
-- Retorna: JSON con items restaurados
```

---

## ⚠️ Validaciones y Reglas

### **Al Crear un Paquete:**
- ✅ Debe tener al menos 2 productos
- ✅ No se pueden anidar paquetes (paquete dentro de paquete)
- ✅ Todos los productos deben existir y ser tipo 'product'
- ✅ Si `pricing_strategy = 'fixed'`, el precio se usa tal cual
- ✅ Si `pricing_strategy = 'calculated'`, se suma automáticamente

### **Al Vender un Paquete:**
- ✅ Verifica stock del paquete
- ✅ Verifica stock de TODOS los componentes
- ✅ Si algún componente no tiene stock, NO permite la venta
- ✅ Descuenta stock del paquete Y de componentes

### **Al Cancelar Venta:**
- ✅ Restaura stock del paquete
- ✅ Restaura stock de todos los componentes
- ✅ Mantiene integridad de inventario

---

## 🆘 Troubleshooting

### **Error: "Un paquete debe contener al menos 2 productos"**
→ Agrega más productos al paquete. Los paquetes deben tener mínimo 2 items.

### **Error: "No se pueden incluir paquetes dentro de otros paquetes"**
→ Solo productos individuales pueden ser parte de un paquete. No puedes anidar paquetes.

### **Error: "Stock insuficiente para uno o más productos del paquete"**
→ Verifica el stock de cada componente usando `check_package_stock_availability()`.

### **Precio calculado no se actualiza**
→ Asegúrate de que `pricing_strategy = 'calculated'`. Si es 'fixed', el precio no cambia automáticamente.

### **El paquete no descuenta stock de componentes**
→ Verifica que la función `deduct_package_stock` esté siendo llamada en `convertQuoteToSaleImproved`.

---

## 🎯 Casos de Uso Comunes

### **Caso 1: Paquetes por Tipo de Evento**

```typescript
// Paquete "Boda Pequeña" (50 personas)
{
  name: 'Paquete Boda Pequeña',
  pricing_strategy: 'fixed',
  price: 3500,
  package_items: [
    { product_id: 'sillas-tiffany', quantity: 50 },
    { product_id: 'mesas-redondas', quantity: 5 },
    { product_id: 'manteles-blancos', quantity: 5 },
  ]
}

// Paquete "Boda Grande" (100 personas)
{
  name: 'Paquete Boda Grande',
  pricing_strategy: 'fixed',
  price: 6500,
  package_items: [
    { product_id: 'sillas-tiffany', quantity: 100 },
    { product_id: 'mesas-redondas', quantity: 10 },
    { product_id: 'manteles-blancos', quantity: 10 },
    { product_id: 'centro-de-mesa', quantity: 10 },
  ]
}
```

### **Caso 2: Paquete con Precio Calculado (Descuento)**

```typescript
// Suma de componentes: $4,000
// Precio del paquete: $3,500 (ahorro de $500)
{
  name: 'Paquete Cumpleaños',
  pricing_strategy: 'fixed',
  price: 3500,  // 12.5% descuento
  package_items: [
    { product_id: 'sillas-infantiles', quantity: 30 },  // $20 × 30 = $600
    { product_id: 'mesas-infantiles', quantity: 4 },    // $150 × 4 = $600
    { product_id: 'decoracion-globos', quantity: 10 },  // $80 × 10 = $800
    { product_id: 'manteleria-colores', quantity: 4 },  // $100 × 4 = $400
    // ...resto suma $1,600
  ]
}
```

### **Caso 3: Paquete Dinámico (Precio Calculado)**

```typescript
// El precio se ajusta automáticamente si cambias el precio de componentes
{
  name: 'Paquete Básico Evento',
  pricing_strategy: 'calculated',  // ← CLAVE
  price: 0,  // Se calcula automáticamente
  package_items: [
    { product_id: 'sillas', quantity: 40 },
    { product_id: 'mesas', quantity: 4 },
  ]
}

// Si actualizas el precio de "sillas" de $20 a $25
// El paquete automáticamente pasa de $1,400 a $1,600
```

---

## 📈 Próximos Pasos

Una vez que apliques la migración y pruebes el sistema:

1. **Crear tus primeros paquetes** desde la UI
2. **Probar el flujo completo** de cotización → venta
3. **Verificar descuentos de stock** en la base de datos
4. **Integrar en tu flujo de trabajo** actual

---

**¡Sistema de Paquetes implementado! 🎉**

Para dudas o problemas, revisa la sección de Troubleshooting o consulta los archivos de código.
