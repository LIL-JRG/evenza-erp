# Implement AI Tools & Enhanced System Prompt

I will upgrade the chatbot to support function calling (tools) for data fetching and modernize the implementation using the Vercel AI SDK. I will also implement a structured system prompt following your best practices.

## 1. Backend Refactor (`app/api/chat/route.ts`)

* **Switch to Vercel AI SDK:** Replace the manual `fetch` with `streamText` and `createOpenAI` (configured for DeepSeek).

* **Implement Tools:**

  * `searchUsers`: Find users by name or email using `supabaseAdmin`.

  * `getSubscriptionStatus`: Retrieve subscription details for a specific user.

  * `getKeyMetrics`: Get a summary of total users and active subscriptions.

* **New System Prompt:**

  * Implement the "Clarity and Precision" and "Structured Prompt Formats" guidelines.

  * Define explicit roles (ERP Assistant) and tone constraints.

  * Add specific instructions for tool usage (e.g., "Always search for a user before checking their subscription").

## 2. Frontend Refactor (`components/dashboard/chat-widget.tsx`)

* **Adopt** **`useChat`** **Hook:** Replace the manual `fetch`, `useState` for messages, and SSE parsing with the robust `useChat` hook from `@ai-sdk/react`.

* **Simplify State Management:** `useChat` handles loading states, message appending, and streaming automatically.

* **Maintain UI:** Keep the existing beautiful ShadCN/Tailwind UI, connecting it to the new hook.

## 3. Verification

* Verify that the chatbot can answer general questions.

* Verify that asking "Who is user \[Name]?" triggers the `searchUsers` tool.

* Verify that the Markdown rendering and auto-scroll (previously fixed) continue to work with the new message format.

\
REVISA QUE EL CHATBOT SEA OPTIMIZADO PARA EL LENGUAJE ESPAÑOL.
