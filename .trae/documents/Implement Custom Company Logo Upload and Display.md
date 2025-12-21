I will implement the functionality to allow users to upload and display a custom company logo in the sidebar.

### 1. Database & Storage
*   I will add a `logo_url` column to the `users` table (or `profiles` if separated, currently `users` seems to be the main profile table based on `DashboardLayout`).
*   I will verify/create a Supabase Storage bucket named `logos`.
*   *Note*: Since I cannot directly execute SQL or create buckets in your Supabase instance, I will provide the SQL migration/script and instructions for you to run, and I will write the code assuming these exist.

### 2. Backend Logic
*   I will update `app/dashboard/layout.tsx` to fetch the `logo_url` along with other user details.
*   I will pass this `logo` to `AppSidebar`.

### 3. UI Components
*   **TeamSwitcher**: I will modify `components/team-switcher.tsx` to accept a `logoUrl` prop. If present, it will render an `<img>` (or Next.js `<Image>`); otherwise, it will fallback to the current icon.
*   **Settings Page**: Since the user mentioned "onboarding or config", I will enhance the existing `/dashboard/settings` page (or create it if it's just a placeholder) to include a "Company Settings" section with a file uploader for the logo.

### 4. Implementation Details
*   **Upload Component**: I'll create a simple file input that uploads to the `logos` bucket and updates the `users` table with the public URL.

**Step-by-step Plan:**
1.  Define the `logo_url` field in the `users` table (via SQL file/instructions).
2.  Create `app/dashboard/settings/page.tsx` (or update existing) with logo upload functionality.
3.  Update `app/dashboard/layout.tsx` to fetch `logo_url` and pass it down.
4.  Update `components/app-sidebar.tsx` and `components/team-switcher.tsx` to render the dynamic logo.

Let's start by checking the current state of `app/dashboard/settings/page.tsx` (if it exists) and the `users` table structure from `layout.tsx`.
