# Migraciones de Base de Datos

Este directorio contiene las migraciones SQL para Evenza ERP.

## Cómo ejecutar las migraciones

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido del archivo de migración
5. Haz clic en **Run** para ejecutar

### Opción 2: Usando Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

## Migraciones Disponibles

### 20231225_create_contracts_table.sql
**Descripción**: Crea la tabla `contracts` y las columnas necesarias en otras tablas.

**Incluye**:
- Tabla `contracts` con todos sus campos
- Índices para optimización
- Políticas RLS (Row Level Security)
- Triggers para `updated_at`
- Columna `template` en tabla `invoices`
- Columna `preferred_invoice_template` en tabla `users`

**Para ejecutar**:
```sql
-- Copia y pega el contenido de:
supabase/migrations/20231225_create_contracts_table.sql
```

### 20231225_create_contracts_table_rollback.sql
**Descripción**: Revierte la migración de contratos (rollback).

**⚠️ ADVERTENCIA**: Esta operación eliminará permanentemente todos los contratos.

**Para ejecutar**:
```sql
-- Solo si necesitas revertir la migración
-- Copia y pega el contenido de:
supabase/migrations/20231225_create_contracts_table_rollback.sql
```

## Verificar que la migración fue exitosa

Después de ejecutar la migración, verifica con:

```sql
-- Ver la estructura de la tabla
SELECT * FROM information_schema.tables WHERE table_name = 'contracts';

-- Ver las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contracts'
ORDER BY ordinal_position;

-- Ver las políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'contracts';

-- Ver los índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'contracts';
```

## Orden de Migraciones

Las migraciones deben ejecutarse en orden cronológico según su timestamp:

1. `20231225_create_contracts_table.sql` - ✅ Primera migración de contratos

## Notas Importantes

- **Siempre haz backup** antes de ejecutar migraciones en producción
- Las migraciones son **idempotentes** (puedes ejecutarlas múltiples veces sin error)
- Los rollbacks **eliminan datos permanentemente** - usa con precaución
- Las políticas RLS garantizan que cada usuario solo vea sus propios datos

## Solución de Problemas

### Error: "relation already exists"
La tabla ya existe. Esto es seguro - la migración usa `CREATE TABLE IF NOT EXISTS`.

### Error: "function update_updated_at_column does not exist"
La migración crea la función automáticamente. Si persiste, verifica que tienes permisos.

### Error: "permission denied"
Asegúrate de estar ejecutando como el usuario correcto de Supabase con permisos suficientes.

## Contacto

Para problemas con migraciones, revisa la documentación de Supabase:
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
