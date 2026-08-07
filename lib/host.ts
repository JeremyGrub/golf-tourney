import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertLoaded } from "@/lib/supabase/assert";
import { isUuid } from "@/lib/uuid";

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

  // Bail before Postgres sees garbage — an id that isn't UUID-shaped raises
  // 22P02, and that error would otherwise be reported as a backend failure
  // rather than the plain 404 it is.
  if (!isUuid(id)) notFound();

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
