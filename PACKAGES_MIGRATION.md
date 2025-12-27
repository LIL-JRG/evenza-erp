# 📦 Instrucciones de Migración - Sistema de Paquetes

## 🎯 Objetivo
Agregar funcionalidad de paquetes al sistema de productos.

---

## ⚡ Aplicar Migración en Supabase

### **Paso 1: Ejecutar SQL**

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia y ejecuta el contenido de: `supabase/migrations/002_add_packages_system.sql`

### **Paso 2: Verificar Migración**

Ejecuta estas queries para confirmar:

```sql
-- 1. Verificar nuevas columnas en products
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('type', 'package_items', 'pricing_strategy', 'package_description')
ORDER BY ordinal_position;

-- Deberías ver:
-- type              | text    | 'product'::text
-- package_items     | jsonb   | NULL
-- pricing_strategy  | text    | 'fixed'::text
-- package_description | text  | NULL
```

```sql
-- 2. Verificar funciones SQL
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'calculate_package_price',
    'check_package_stock_availability',
    'deduct_package_stock',
    'restore_package_stock'
  );

-- Deberías ver 4 funciones
```

```sql
-- 3. Verificar índice
SELECT indexname
FROM pg_indexes
WHERE tablename = 'products'
  AND indexname = 'idx_products_type';

-- Debería existir
```

### **Paso 3: Probar Funciones**

```sql
-- 3.1 Crear un producto de prueba
INSERT INTO products (user_id, name, price, stock, type)
VALUES (
  auth.uid(),  -- Tu user ID
  'Silla de Prueba',
  50,
  100,
  'product'
)
RETURNING id;  -- Guarda este ID

-- 3.2 Crear otro producto
INSERT INTO products (user_id, name, price, stock, type)
VALUES (
  auth.uid(),
  'Mesa de Prueba',
  200,
  20,
  'product'
)
RETURNING id;  -- Guarda este ID

-- 3.3 Crear un paquete de prueba
INSERT INTO products (
  user_id,
  name,
  price,
  stock,
  type,
  pricing_strategy,
  package_items
)
VALUES (
  auth.uid(),
  'Paquete de Prueba',
  1000,
  5,
  'package',
  'fixed',
  '[
    {"product_id": "uuid-silla-de-paso-3.1", "quantity": 10},
    {"product_id": "uuid-mesa-de-paso-3.2", "quantity": 2}
  ]'::jsonb
)
RETURNING id;  -- Guarda este ID para pruebas

-- 3.4 Probar calculate_package_price
SELECT calculate_package_price('uuid-paquete-de-paso-3.3');
-- Debería retornar: 900.00 (10 sillas × $50 + 2 mesas × $200)

-- 3.5 Probar check_package_stock_availability
SELECT check_package_stock_availability('uuid-paquete-de-paso-3.3', 2);
-- Debería retornar JSON con available: true

-- 3.6 Probar deduct_package_stock
SELECT deduct_package_stock('uuid-paquete-de-paso-3.3', 1);
-- Debería retornar success: true

-- 3.7 Verificar que se descontó stock
SELECT name, stock FROM products
WHERE id IN (
  'uuid-silla-de-paso-3.1',
  'uuid-mesa-de-paso-3.2',
  'uuid-paquete-de-paso-3.3'
);
-- Silla: 90 (100 - 10)
-- Mesa: 18 (20 - 2)
-- Paquete: 4 (5 - 1)

-- 3.8 Restaurar stock
SELECT restore_package_stock('uuid-paquete-de-paso-3.3', 1);

-- 3.9 Verificar restauración
SELECT name, stock FROM products
WHERE id IN (
  'uuid-silla-de-paso-3.1',
  'uuid-mesa-de-paso-3.2',
  'uuid-paquete-de-paso-3.3'
);
-- Todos deberían estar en su stock original
```

---

## ✅ Checklist

- [ ] Migración SQL ejecutada sin errores
- [ ] 4 nuevas columnas agregadas a `products`
- [ ] Índice `idx_products_type` creado
- [ ] 4 funciones SQL creadas
- [ ] Funciones probadas y funcionando correctamente
- [ ] Código TypeScript actualizado (ya está hecho)
- [ ] Componentes UI creados (ya está hecho)

---

## 🔄 Rollback (Si necesitas revertir)

```sql
-- ⚠️ ADVERTENCIA: Esto eliminará todos los paquetes creados

-- 1. Eliminar funciones
DROP FUNCTION IF EXISTS calculate_package_price;
DROP FUNCTION IF EXISTS check_package_stock_availability;
DROP FUNCTION IF EXISTS deduct_package_stock;
DROP FUNCTION IF EXISTS restore_package_stock;

-- 2. Eliminar índice
DROP INDEX IF EXISTS idx_products_type;

-- 3. Eliminar paquetes existentes
DELETE FROM products WHERE type = 'package';

-- 4. Eliminar columnas
ALTER TABLE products DROP COLUMN IF EXISTS type;
ALTER TABLE products DROP COLUMN IF EXISTS package_items;
ALTER TABLE products DROP COLUMN IF EXISTS pricing_strategy;
ALTER TABLE products DROP COLUMN IF EXISTS package_description;
```

---

## 🆘 Errores Comunes

### **Error: "column 'type' already exists"**
→ Las columnas ya fueron creadas. Puedes continuar con la verificación.

### **Error: "function calculate_package_price already exists"**
→ Las funciones ya existen. Si quieres actualizarlas, primero `DROP FUNCTION` y luego créalas de nuevo.

### **Error al ejecutar la migración completa**
→ Ejecuta las queries en bloques:
1. Primero las alteraciones de tabla
2. Luego las funciones una por una
3. Finalmente los comentarios

---

## 📞 Siguiente Paso

Una vez completada la migración:

1. ✅ Verifica que todo funcionó
2. 📝 Lee `PACKAGES_SYSTEM.md` para ejemplos de uso
3. 🎨 Integra los componentes UI en tu página de productos
4. 🧪 Crea tu primer paquete de prueba

---

**¡Migración de Paquetes lista! 🚀**
