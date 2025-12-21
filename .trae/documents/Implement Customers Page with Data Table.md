I will implement the "Customers" page (`/dashboard/customers`) by reusing patterns from the Events page.

### 1. Data Fetching

* I will add `getCustomersList` to `app/dashboard/events/actions.ts` (or create a new `actions.ts` for customers if preferred, but existing actions are mixed, so I'll likely stick to one or separate if it gets too big. Actually, `app/dashboard/customers/actions.ts` is cleaner). - YES CREATE A NEW ONE.

  * It will support pagination, search (by name/email), and sorting.

* I will reuse `createCustomer` which already exists in `app/dashboard/events/actions.ts`.

### 2. UI Components

* **Data Table**: I will create `components/customers/data-table.tsx` based on `components/events/data-table.tsx` but adapted for customers (if needed) or reuse the generic one if possible. Since `DataTable` usually takes `columns` as props, I might be able to reuse `components/events/data-table.tsx` if it's generic enough. I will check `components/events/data-table.tsx` content to confirm.

* **Columns**: Create `components/customers/columns.tsx` to define columns: Name, Email, Phone, Address, Actions (Edit/Delete).

* **Create/Edit Sheet**: Create `components/customers/create-customer-sheet.tsx`. I will base this on `CreateEventSheet` but for customers. I see `create-customer-dialog.tsx` exists, but the user wants a "Sheet" or at least a similar experience to the Events page. I'll upgrade the existing dialog to a Sheet or create a new Sheet component to match the "Events" style better if `CreateEventSheet` uses a Sheet.

### 3. Page Implementation

* Create `app/dashboard/customers/page.tsx` that:

  * Fetches customers using `getCustomersList`.

  * Renders the `DataTable`.

  * Includes the `CreateCustomerSheet`.

### 4. Refactoring

* I noticed `getCustomers` in `actions.ts` only fetches minimal data (`id, full_name, email`). I will create a more robust `getCustomersList` that fetches all fields and supports pagination/filtering.

**Step-by-step Plan:**

1. Create `app/dashboard/customers/actions.ts` for customer-specific actions (cleaner separation).
2. Create `components/customers/columns.tsx`.
3. Create `components/customers/data-table.tsx` (or reuse generic if possible).
4. Create `components/customers/create-customer-sheet.tsx` (using `Sheet` component for consistency with Events).
5. Create `app/dashboard/customers/page.tsx`.

