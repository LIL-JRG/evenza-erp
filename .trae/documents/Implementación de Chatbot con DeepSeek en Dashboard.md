Voy a implementar el Chatbot flotante integrado con DeepSeek siguiendo tus requerimientos.

### Plan de Implementación

1.  **Instalación de Dependencias**:
    *   Instalaré el **Vercel AI SDK** (`ai` y `@ai-sdk/openai`), que es el estándar moderno para Next.js y compatible con la API de DeepSeek (formato OpenAI). Esto facilitará enormemente el manejo del streaming de mensajes y el estado del chat.

2.  **Configuración del Backend (API Route)**:
    *   Crearé el archivo `app/api/chat/route.ts`.
    *   Configuraré el cliente de OpenAI apuntando a la `baseURL` de DeepSeek (`https://api.deepseek.com`).
    *   Implementaré la función `POST` para manejar las peticiones de chat usando el modelo `deepseek-chat`.
    *   Dejaré preparada la estructura para "Function Calling" (Uso de Herramientas) para que en el futuro sea fácil agregar las capacidades de registro de eventos y clientes.

3.  **Creación del Componente de Chat (`ChatWidget`)**:
    *   Crearé un nuevo componente en `components/dashboard/chat-widget.tsx`.
    *   **Diseño**:
        *   **Botón Flotante**: Un círculo en la esquina inferior derecha con un icono de mensaje.
        *   **Ventana de Chat**: Un panel tipo "Popover" que se despliega al hacer clic, con un diseño limpio y moderno (ShadCN UI).
    *   **Lógica**: Usaré el hook `useChat` del SDK para manejar el envío de mensajes, el historial y el estado de carga automáticamente.

4.  **Integración en el Dashboard**:
    *   Modificaré `app/dashboard/layout.tsx` para incluir el `ChatWidget`. Esto asegurará que el chat sea persistente y visible en **todas** las rutas del dashboard.

5.  **Variables de Entorno**:
    *   Te indicaré dónde colocar tu `DEEPSEEK_API_KEY` para que el sistema funcione.

### ¿Por qué este enfoque?
*   **Escalable**: El uso del AI SDK permite agregar "Tools" (herramientas) más adelante para que el bot pueda interactuar con tu base de datos (Supabase) de forma nativa.
*   **Rápido y Reactivo**: La interfaz se sentirá instantánea gracias al streaming de texto.
*   **Limpio**: Mantendrá la estética de tu aplicación actual.

¿Te parece bien proceder con este plan?