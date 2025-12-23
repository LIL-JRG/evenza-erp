# Plan de Implementación: Módulo de Productos e Inventario

Este plan detalla la creación del módulo de productos, incluyendo la base de datos, el manejo de imágenes en Supabase Storage y la interfaz de usuario con ShadCN.

## 1. Migración de Base de Datos y Storage

Crearé un nuevo archivo de migración en `supabase/migrations/20241222_create_products_table.sql` que contendrá:

* **Tabla** **`products`**: Campos para nombre, descripción, SKU, precio (renta), stock, imagen, etc.

* **Bucket** **`products`**: Configuración de Supabase Storage para alojar las imágenes.

* **Políticas RLS**: Seguridad para que cada usuario solo gestione sus propios productos e imágenes.

**Acción requerida**: Una vez creado el archivo, deberás ejecutar su contenido en el Editor SQL de Supabase.

## 2. Instalación de Dependencias

Ejecutaré comandos para instalar los componentes de UI faltantes:

* `textarea` (para la descripción del producto).

## 3. Lógica del Servidor (`app/dashboard/products/actions.ts`)

Implementaré las Server Actions para interactuar con Supabase:

* `createProduct`: Recibirá los datos del formulario + `FormData` para la imagen.

  * Subirá la imagen al bucket `products`.

  * Obtendrá la URL pública.

  * Generará SKU automático si no se provee (`PRD-{001}+{002}...{0010}`) INCREMENTAL (PREFIX 00X).

  * Insertará el registro en la base de datos.

* `getProducts`, `updateProduct`, `deleteProduct`: Operaciones estándar CRUD.

## 4. Interfaz de Usuario (`app/dashboard/products/`)

Desarrollaré los siguientes componentes:

* **`product-dialog.tsx`**: Formulario modal usando `zod` y `react-hook-form`.

  * Incluirá un componente de carga de imágenes con previsualización.

  * Campos: Nombre, SKU, Precio (Renta), Stock, Descripción.

* **`columns.tsx`**: Definición de columnas para la tabla (Imagen pequeña, Nombre, SKU, Stock, Precio, Acciones).

* **`data-table.tsx`**: Tabla reutilizable con buscador y paginación (basada en las existentes).

* **`page.tsx`**: Página principal que integra la tabla y el botón de creación.

## 5. Actualización de Navegación

* Modificaré `components/app-sidebar.tsx` para agregar el enlace "Productos" en el menú lateral.

## 6. Verificación

* Confirmaré que se puedan crear productos con imagen.

* Verificaré que las imágenes se guarden en el bucket correcto.

* Probaré el filtrado y la edición.

