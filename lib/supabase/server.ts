import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Cookie writes only work in Server Actions and Route Handlers —
          // in a Server Component context `cookieStore.set` throws. The PKCE
          // verifier is written during signInWithOtp (a Server Action), so
          // it *should* always succeed; if it doesn't we need to know,
          // because the callback will fail with `pkce_code_verifier_not_found`
          // and the user sees a dead-end.
          for (const { name, value, options } of cookiesToSet) {
            try {
              cookieStore.set(name, value, options);
            } catch (err) {
              // Swallow in Server Components (expected), but log anywhere
              // else — this is the signal when PKCE flows silently break.
              // eslint-disable-next-line no-console
              console.warn(
                "[supabase/server] cookie set failed for",
                name,
                err instanceof Error ? err.message : err
              );
            }
          }
        },
      },
    }
  );
}
