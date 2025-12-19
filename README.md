# Evenza ERP

**Evenza ERP** es una solución integral para la gestión de eventos, contratos de renta y administración de clientes. Diseñado para simplificar y optimizar las operaciones de negocios de eventos, Evenza ofrece herramientas potentes para mantener todo sincronizado y bajo control.

## 🚀 Características Principales

*   **Gestión de Clientes y Contratos**: Administra fácilmente tu base de datos de clientes y crea contratos de renta detallados.
*   **Calendario de Eventos**: Visualiza la disponibilidad de equipos y espacios con un calendario interactivo.
*   **Panel de Control (Dashboard)**: Métricas y análisis en tiempo real para tomar decisiones informadas.
*   **Pagos Integrados**: Integración con Stripe para gestionar cobros y suscripciones.
*   **Autenticación Segura**: Sistema de login y registro robusto, incluyendo soporte para Google OAuth.
*   **Diseño Responsivo**: Interfaz moderna y adaptable a cualquier dispositivo móvil o de escritorio.

## 🛠 Tech Stack

*   **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
*   **Backend & Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
*   **Pagos**: [Stripe](https://stripe.com/)
*   **Gestión de Estado y Formularios**: React Hook Form, Zod
*   **Gráficos**: Recharts

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

*   [Node.js](https://nodejs.org/) (v18 o superior recomendado)
*   [pnpm](https://pnpm.io/) (Gestor de paquetes)
*   Una cuenta en [Supabase](https://supabase.com/)
*   Una cuenta en [Stripe](https://stripe.com/)

## 🔧 Instalación y Configuración

1.  **Clonar el repositorio**

    ```bash
    git clone https://github.com/tu-usuario/evenza-erp.git
    cd evenza-erp
    ```

2.  **Instalar dependencias**

    ```bash
    pnpm install
    ```

3.  **Configurar Variables de Entorno**

    Crea un archivo `.env.local` en la raíz del proyecto y agrega las siguientes variables. Puedes usar `.env.example` como referencia si existe (o copiar el bloque de abajo).

    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

    # Auth
    JWT_SECRET=tu_jwt_secret_seguro
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # Stripe
    STRIPE_SECRET_KEY=tu_stripe_secret_key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
    ```

4.  **Configurar la Base de Datos**

    Ejecuta las migraciones de SQL en tu proyecto de Supabase. Los archivos de migración se encuentran en la carpeta `supabase/migrations/`. Puedes copiarlos y ejecutarlos en el Editor SQL de Supabase Dashboard.

    *   `01_initial_schema.sql`
    *   `02_add_password_storage.sql`
    *   ... (y los siguientes en orden)

5.  **Ejecutar el servidor de desarrollo**

    ```bash
    pnpm dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📂 Estructura del Proyecto

```
evenza-erp/
├── app/                 # Rutas y páginas de Next.js (App Router)
│   ├── api/             # API Routes (Backend logic)
│   ├── auth/            # Páginas de autenticación
│   ├── dashboard/       # Páginas del panel de control
│   └── ...
├── components/          # Componentes de React reutilizables
│   ├── ui/              # Componentes base (botones, inputs, etc.)
│   └── ...              # Componentes de secciones (Hero, Pricing, etc.)
├── lib/                 # Utilidades y configuración de clientes (Supabase, Stripe)
├── public/              # Archivos estáticos e imágenes
├── styles/              # Estilos globales
├── supabase/            # Migraciones y configuración de base de datos
└── ...
```

## 📜 Scripts Disponibles

*   `pnpm dev`: Inicia el servidor de desarrollo.
*   `pnpm build`: Construye la aplicación para producción.
*   `pnpm start`: Inicia el servidor de producción.
*   `pnpm lint`: Ejecuta el linter para verificar el código.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un Pull Request para mejoras y correcciones.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
