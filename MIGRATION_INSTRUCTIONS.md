# 📋 Instrucciones de Migración - Sistema de Reservas y Pagos

## 🎯 Objetivo
Implementar sistema de reservas de stock, gestión de pagos mejorada y estados actualizados.

---

## 📝 Pasos para Aplicar en Supabase

### **1. Crear Nueva Tabla y Funciones**

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia y ejecuta el contenido de: `supabase/migrations/001_add_reservations_and_payments.sql`
4. Verifica que se hayan creado:
   - ✅ Tabla `stock_reservations`
   - ✅ Tabla `activity_log`
   - ✅ Funciones `check_stock_availability()` y `get_available_stock()`
   - ✅ Nuevas columnas en `invoices`

---

### **2. Actualizar Constraints de Estados (IMPORTANTE)**

#### **A. Actualizar Estados de Eventos:**

```sql
-- Eliminar constraint antiguo
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Agregar nuevo constraint con estados adicionales
ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'confirmed', 'in_progress', 'returned', 'completed', 'cancelled'));
```

#### **B. Actualizar Estados de Invoices (OPCIONAL pero recomendado):**

```sql
-- Eliminar constraint antiguo
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Agregar nuevo constraint con estados mejorados
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'sent', 'accepted', 'paid', 'cancelled'));
```

---

### **3. Migrar Datos Existentes**

#### **A. Actualizar payment_status en facturas existentes:**

```sql
-- Marcar como pagadas las facturas completadas
UPDATE invoices
SET payment_status = 'paid'
WHERE status = 'completed';

-- Marcar como no pagadas las borradores y pendientes
UPDATE invoices
SET payment_status = 'unpaid'
WHERE status IN ('draft', 'pending');

-- Calcular balance debido
UPDATE invoices
SET balance_due = total - deposit_amount
WHERE payment_status IN ('unpaid', 'partial');
```

#### **B. (Opcional) Actualizar estados de invoices a nuevos valores:**

```sql
-- Si decides usar los nuevos estados:
UPDATE invoices SET status = 'sent' WHERE status = 'pending';
UPDATE invoices SET status = 'paid' WHERE status = 'completed';
```

---

### **4. Verificar Migración**

Ejecuta estas queries para verificar:

```sql
-- 1. Verificar tabla de reservas
SELECT COUNT(*) FROM stock_reservations;

-- 2. Verificar nuevas columnas en invoices
SELECT id, payment_status, deposit_amount, balance_due
FROM invoices
LIMIT 5;

-- 3. Verificar funciones
SELECT check_stock_availability(
  'uuid-del-producto',  -- Reemplaza con UUID real
  5,                     -- Cantidad
  '2025-12-20',         -- Fecha inicio
  '2025-12-22'          -- Fecha fin
);

-- 4. Verificar activity_log
SELECT COUNT(*) FROM activity_log;
```

---

## 🔄 Rollback (Si necesitas revertir)

```sql
-- ⚠️ ADVERTENCIA: Esto eliminará todas las reservas y logs

-- 1. Eliminar tablas nuevas
DROP TABLE IF EXISTS stock_reservations CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;

-- 2. Eliminar funciones
DROP FUNCTION IF EXISTS check_stock_availability;
DROP FUNCTION IF EXISTS get_available_stock;
DROP FUNCTION IF EXISTS log_activity;
DROP FUNCTION IF EXISTS update_reservation_timestamp;

-- 3. Eliminar columnas nuevas de invoices
ALTER TABLE invoices DROP COLUMN IF EXISTS payment_status;
ALTER TABLE invoices DROP COLUMN IF EXISTS deposit_amount;
ALTER TABLE invoices DROP COLUMN IF EXISTS deposit_paid_at;
ALTER TABLE invoices DROP COLUMN IF EXISTS balance_due;
ALTER TABLE invoices DROP COLUMN IF EXISTS payment_due_date;
ALTER TABLE invoices DROP COLUMN IF EXISTS payment_method;
ALTER TABLE invoices DROP COLUMN IF EXISTS generate_contract;

-- 4. Restaurar constraints antiguos
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'confirmed', 'completed', 'cancelled'));

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'pending', 'completed', 'cancelled'));
```

---

## ✅ Checklist Post-Migración

- [ ] Tabla `stock_reservations` creada
- [ ] Tabla `activity_log` creada
- [ ] Funciones SQL creadas
- [ ] Columnas de pago agregadas a `invoices`
- [ ] Constraints de estados actualizados
- [ ] Datos existentes migrados
- [ ] Queries de verificación ejecutadas correctamente
- [ ] Frontend actualizado (siguiente paso)

---

## 🆘 Soporte

Si encuentras errores:
1. Revisa los mensajes de error en Supabase SQL Editor
2. Verifica que las tablas `events`, `invoices`, `products` existan
3. Asegúrate de tener permisos de admin en Supabase
4. Si un constraint falla, verifica que no haya datos que lo violen

---

## 📞 Siguiente Paso

Una vez completada la migración en Supabase:
1. Verifica que todo funcionó ✅
2. Vuelve al código (ya está actualizado con los nuevos tipos y funciones)
3. Prueba crear una reserva de stock
4. Prueba el nuevo flujo de pagos
