"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRequestOrigin } from "@/lib/site-url";

/**
 * Translate a Supabase auth error into a user-facing `err` code that the
 * login page knows how to render. We keep the set small on purpose —
 * anything unexpected falls through to `send_failed` and the user sees a
 * generic retry message.
 */
function classifySignInError(error: unknown): string {
  if (!error || typeof error !== "object") return "send_failed";
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const status = "status" in error ? Number((error as { status?: unknown }).status) : 0;

  if (code === "over_email_send_rate_limit" || status === 429) {
    return "rate_limited";
  }
  if (code === "email_address_invalid" || code === "invalid_email") {
    return "bad_email";
  }
  return "send_failed";
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) {
    redirect("/login?err=bad_email");
  }

  const supabase = await createClient();
  const origin = await getRequestOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("signInWithOtp error:", error);
    redirect(`/login?err=${classifySignInError(error)}`);
  }

  redirect(`/login?sent=1&to=${encodeURIComponent(email)}`);
}
