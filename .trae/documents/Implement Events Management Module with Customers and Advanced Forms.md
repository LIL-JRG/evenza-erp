# Create "Events" Module with Advanced Filtering and Creation Flow

## 1. Database Schema Updates

* **Update** **`events`** **table (Migration):**

  * Add columns: `customer_id` (FK to `users`? Or a separate `customers` table? *Correction: We need a* *`customers`* *table first as implied by "create new clients"*).

  * Add `start_time` (Time), `end_time` (Time), `event_address` (Text).

  * Add `services` (JSONB) to store array of `{ type, quantity, description, etc. }`.

* **Create** **`customers`** **table (Migration):**

  * `id`, `user_id` (owner), `full_name`, `email`, `phone`, `address`, `created_at`.

  * RLS policies for owner access.

* **Update** **`events`** **table relation:**

  * Link `events.customer_id` to `customers.id`.

## 2. Install Shadcn Components

* `npx shadcn@latest add table` (Data Table)

* `npx shadcn@latest add pagination`

* `npx shadcn@latest add sheet` (For side panel forms)

* `npx shadcn@latest add popover` (For date picker)

* `npx shadcn@latest add calendar` (For date picker)

* `npx shadcn@latest add dialog` (For customer creation inside sheet?)

* `npx shadcn@latest add command` (For combobox/search)

* `npm install date-fns` (Already installed, ensure version compatibility)

* `npm install react-hook-form zod` (For form handling)

## 3. Server Actions (`app/dashboard/events/actions.ts`)

* `getEvents(page, limit, search, status_filter)`: Fetch events with pagination and filters.

* `createEvent(data)`: Insert new event with all details.

* `getCustomers()`: Fetch list for the "Assign Client" dropdown.

* `createCustomer(data)`: Create a new customer from the event form.

## 4. Components Implementation

* **`components/events/event-table.tsx`:**

  * Use Shadcn `Table`.

  * Columns: Title, Client, Date, Time, Location, Status, Actions (Edit/Delete).

  * Implement "Empty State" when no events found.

* **`components/events/event-filters.tsx`:**

  * Search input (by title/client).

  * Status dropdown filter.

  * Date range picker filter.

* **`components/events/create-event-sheet.tsx`:**

  * Shadcn `Sheet` component.

  * **Form (React Hook Form + Zod):**

    * **Client Selection:** Combobox with "Create New Client" option.

    * **Date & Time:** DatePicker + Time Inputs (Start/End).

    * **Location:** Input for address.

    * **Services (Dynamic List):**

      * "Add Service" button.

      * Row: Type (Select: Chair, Table, etc.), Quantity (Input), Color/Details (Input).

* **`components/events/create-customer-dialog.tsx`:**

  * Dialog to quickly add a client name/phone/email without leaving the event flow.

## 5. Page Integration

* **`app/dashboard/events/page.tsx`:**

  * Layout with Header "Eventos" + "Nuevo Evento" button.

  * Render `EventFilters`.

  * Render `EventTable` (Client component fetching data via server action).

  * Pagination controls at bottom.

## 6. Sidebar Update

* Update `components/app-sidebar.tsx` to add the "Eventos" link under "Calendario" (or where requested).

## 7. Refinement (The "Plan" Details)

* **Service Types Ideas:**

  * *Mobiliario:* Sillas (Tiffany, Avant Garde, Plegable), Mesas (Redonda, Tablón, Imperial).

  * *Mantelería:* Manteles (Blanco, Negro, Colores), Servilletas, Caminos.

  * *Varios:* Carpas, Pistas de baile, Loza, Cristalería.

  * *Logística:* Flete, Montaje, Desmontaje.

* **Contract Data:** The schema structure (JSONB for services) will allow easy generation of PDF contracts later by iterating over the items.

