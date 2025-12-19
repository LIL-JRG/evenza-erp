# Create Dashboard Stats & Events Schema

## 1. Database Schema Update

* Create a new migration file `supabase/migrations/09_create_events_table.sql`.

* Create table `events` with:

  * `id` (UUID, Primary Key)

  * `user_id` (UUID, Foreign Key to `users`, with RLS)

  * `name` (Text)

  * `status` (Text: 'pending', 'confirmed', 'completed', 'cancelled')

  * `total_amount` (Numeric, for revenue)

  * `event_date` (Timestamp with Time Zone)

  * `created_at` (Timestamp with Time Zone)

* Enable RLS on `events` and add policies for CRUD operations (authenticated users can only see/edit their own events).

## 2. Install Shadcn Components

* Install the `Select` component: `npx shadcn@latest add native-select`.

* Ensure `Card` and `Skeleton` are available (already verified).

## 3. Server Actions for Data Fetching

* Create `app/dashboard/actions.ts` to handle secure data fetching from Supabase.

* Implement `getDashboardStats(range: 'monthly' | 'weekly' | 'daily')` function:

  * Calculate date ranges based on the selected filter.

  * Query `events` table for:

    * Sum of `total_amount` (Total Revenue).

    * Count of all records (Total Events).

    * Count where `status` is 'pending' (Pending Events).

  * Return formatted data.

## 4. Dashboard UI Implementation

* Create `components/dashboard/dashboard-stats.tsx` (Client Component):

  * State management for the selected filter (default: 'monthly').

  * State management for loading and data.

  * `useEffect` to fetch data when the filter changes.

  * Render 3 `Card` components with:

    * Icons (DollarSign, Calendar, Clock/AlertCircle).

    * Animated number transitions (or simple text update).

    * Skeleton loaders while fetching.

    * Error handling display.

  * Header section with the "Native Select" (Shadcn Select) for filtering.

* Update `app/dashboard/page.tsx` to include the `DashboardStats` component.

## 5. Verification

* Verify the migration runs successfully.

* Verify the dashboard loads with "0" values (since table is empty).

* (Optional) Manually insert a test event in Supabase to verify the counters update.

