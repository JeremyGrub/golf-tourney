"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRequestOrigin } from "@/lib/site-url";

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
    redirect("/login?err=send_failed");
  }

  redirect(`/login?sent=1&to=${encodeURIComponent(email)}`);
}
