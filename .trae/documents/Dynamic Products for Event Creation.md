## Plan de Implementación

### 1.  Modificar el Formulario de Eventos (`create-event-sheet.tsx`)
*   **Objetivo**: Reemplazar la lista estática `serviceTypes` con una lista dinámica de productos obtenidos del inventario del usuario.
*   **Acciones**:
    *   Importar `getProducts` desde `app/dashboard/products/actions.ts`.
    *   Crear un nuevo estado `products` para almacenar la lista de productos.
    *   Añadir un `useEffect` que se ejecute cuando el componente se monta para cargar los productos usando `getProducts`.
    *   Reemplazar el mapeo de `serviceTypes` en el `<SelectContent>` para que itere sobre la lista `products`.
    *   Actualizar el valor de `defaultValue` y el texto mostrado (`{type}`) para usar `product.name`.

### 2.  Actualizar el Chatbot (`tools.ts` y `route.ts`)
*   **Objetivo**: Permitir que el chatbot pueda sugerir productos del inventario cuando el usuario esté creando un evento.
*   **Acciones en `tools.ts`**:
    *   Modificar la herramienta `register_event` para que, en lugar de esperar un array de `services` con un `type` de texto libre, espere un array de `products` donde cada elemento tenga un `product_id` (que correspondería al ID del producto en el inventario) y `quantity`.
*   **Acciones en `route.ts`**:
    *   Actualizar el `SYSTEM_PROMPT` para reflejar el nuevo formato de los productos/servicios en el evento.
    *   Modificar la lógica de ejecución de `register_event` en la función `executeTool` para que transforme el nuevo formato (`products` con `product_id`) al formato antiguo (`services` con `type`) antes de llamar a `createEvent`. Esto implicará buscar el nombre del producto usando su `product_id`.

### 3.  Ajustar el Esquema de Validación (`create-event-sheet.tsx`)
*   **Objetivo**: Asegurarse de que el formulario valide correctamente los datos con el nuevo formato de productos.
*   **Acciones**:
    *   Revisar si el esquema `eventSchema` necesita ajustes para manejar la selección de productos del inventario. Por ejemplo, validar que se haya seleccionado un producto válido de la lista.

### 4.  Manejo de Productos No Encontrados (Chatbot)
*   **Objetivo**: Mejorar la experiencia si el usuario menciona un producto que no existe en el inventario.
*   **Acciones**:
    *   En la función `executeTool` de `route.ts`, cuando se ejecute `register_event`, si un `product_id` no se encuentra en la lista de productos del usuario, el chatbot deberá responder con un error claro o sugerir crear el producto primero.