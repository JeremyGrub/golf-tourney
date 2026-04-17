import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  if (error || !tournament) notFound();
  return { supabase, user, tournament };
}
