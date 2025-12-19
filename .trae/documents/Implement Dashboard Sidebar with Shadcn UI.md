I will set up the dashboard with the Shadcn Sidebar component as requested.

### 1. Install Dependencies

I will install the necessary Shadcn components using `pnpm`:

* `sidebar`: The core sidebar primitive.

* `@shadcn/sidebar-07`: The specific "collapsible to icons" sidebar block you requested.

### 2. Configure Dashboard Layout

I will create a new `app/dashboard/layout.tsx` file to wrap the dashboard pages with the Sidebar provider and layout structure. This ensures the sidebar persists across all dashboard sub-pages.

### 3. Customize Sidebar (`components/app-sidebar.tsx`)

I will modify the installed sidebar component to implement your specific menu structure with appropriate Lucide icons:

**Group 1 title= **

* **Inicio** (Icon: `Home`)

* **Clientes** (Icon: `Users`)

**Group 2** (Separated) title=

* **Calendario** (Icon: `Calendar`)

* **Recibos** (Icon: `Receipt`)

* **Contratos** (Icon: `FileText`)

**Group 3** (Separated) title=

* **Productos** (Icon: `Package`)

* **Mantenimiento** (Icon: `Hammer`)

### 4. Verification

I will verify that:

* The sidebar renders correctly on `/dashboard`.

* The collapsible "icon" mode works.

* The menu items and separators are correctly positioned.

