I will build a custom, interactive Notion-style Calendar page for your dashboard.

### 1. Data Fetching

* **Create Server Action**: Add a function `getCalendarEvents` in `app/dashboard/events/actions.ts` to fetch all events with their dates, times, titles, and statuses from Supabase.

* **Data Structure**: Ensure events are formatted correctly for the calendar (parsing timestamps to valid Date objects).

### 2. Calendar Component (`components/calendar/notion-calendar.tsx`)

* **Custom Grid Implementation**: Instead of using the small date-picker component, I will build a full-width CSS Grid (7 columns) implementation that mimics Notion's layout.

* **Navigation**: Add "Anterior", "Siguiente", and "Hoy" controls to switch months.

* **Date Logic**: Use `date-fns` to generate the grid cells (including padding days from previous/next months).

* **Visual Style**:

  * Dark/Light mode compatible (using `shadcn` theme variables).

  * Bordered cells with the day number in the corner.

  * "Event Chips" (Labels) that appear inside the day cells, showing the time, title and a description.

  * Color coding based on event status (e.g., Blue for confirmed, Green for completed).

### 3. Integration

* **Create Page**: Create `app/dashboard/calendar/page.tsx` to host the new component.

* **Interactivity**:

  * **View Details**: Clicking an event label will open the existing "Edit Event" sheet.

  * **Create Event**: Clicking an empty day cell will open the "Create Event" sheet with that specific date pre-selected.

### 4. Dependencies

* I will reuse your existing `date-fns` and `shadcn/ui` components (Button, Sheet, etc.).

* No new heavy libraries are needed; we'll build this with standard React + Tailwind for maximum performance and design matching.

