# Configuración de Supabase Storage para Logos

## Paso 1: Crear el bucket 'logos'

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a la sección "Storage"
3. Crea un nuevo bucket llamado `logos`
4. Marca el bucket como **público** (Public bucket)

## Paso 2: Configurar políticas de acceso

Ve a la pestaña "Policies" del bucket `logos` y agrega estas políticas:

### Política 1: Permitir subida de logos (INSERT)

```sql
CREATE POLICY "Users can upload their own logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Política 2: Permitir actualización de logos (UPDATE)

```sql
CREATE POLICY "Users can update their own logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Política 3: Permitir lectura pública de logos (SELECT)

```sql
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');
```

### Política 4: Permitir eliminación de logos propios (DELETE)

```sql
CREATE POLICY "Users can delete their own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verificación

Después de configurar las políticas, verifica que:

1. ✅ El bucket `logos` existe
2. ✅ El bucket es público
3. ✅ Las 4 políticas están activas
4. ✅ Puedes subir un archivo de prueba desde la página de configuración

## Notas

- Los logos se guardan con el formato: `{user_id}-{random}.{extension}`
- Los usuarios solo pueden subir/editar/eliminar sus propios logos
- Cualquiera puede ver los logos (necesario para mostrarlos en la UI)
