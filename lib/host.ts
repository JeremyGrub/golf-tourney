import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertLoaded } from "@/lib/supabase/assert";

export async function requireHost() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function loadOwnedTournament(id: string) {
  const { supabase, user } = await requireHost();

  // maybeSingle(), not single(): a tournament you don't own comes back as a
  // null row instead of a PGRST116 error, which keeps a genuine 404 cleanly
  // distinguishable from the backend being unreachable.
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .maybeSingle();

  assertLoaded(error, "the tournament");
  if (!tournament) notFound();
  return { supabase, user, tournament };
}
