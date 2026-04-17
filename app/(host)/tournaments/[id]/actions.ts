"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loadOwnedTournament } from "@/lib/host";

export async function publishTournament(id: string) {
  const { supabase } = await loadOwnedTournament(id);
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "live" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/tournaments/${id}`, "layout");
}

export async function unpublishTournament(id: string) {
  const { supabase } = await loadOwnedTournament(id);
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "draft" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/tournaments/${id}`, "layout");
}

export async function completeTournament(id: string) {
  const { supabase } = await loadOwnedTournament(id);
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "complete" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/tournaments/${id}`, "layout");
}

export async function deleteTournament(id: string) {
  const { supabase } = await loadOwnedTournament(id);
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
  redirect("/dashboard");
}

export async function updateTournamentBasics(id: string, formData: FormData) {
  const { supabase } = await loadOwnedTournament(id);
  const patch = {
    name: String(formData.get("name") ?? "").trim() || undefined,
    course_name: (String(formData.get("course_name") ?? "").trim() || null) as
      | string
      | null,
    course_location: (String(formData.get("course_location") ?? "").trim() ||
      null) as string | null,
    start_date:
      (String(formData.get("start_date") ?? "").trim() || null) as string | null,
    start_time:
      (String(formData.get("start_time") ?? "").trim() || null) as string | null,
  };
  const { error } = await supabase.from("tournaments").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath(`/tournaments/${id}`, "layout");
}

export async function updateHolePar(
  tournamentId: string,
  holeId: string,
  par: number
) {
  if (par < 3 || par > 6) return;
  const { supabase } = await loadOwnedTournament(tournamentId);
  const { error } = await supabase
    .from("holes")
    .update({ par })
    .eq("id", holeId)
    .eq("tournament_id", tournamentId);
  if (error) throw error;
  revalidatePath(`/tournaments/${tournamentId}/holes`);
}

export async function addParticipant(
  tournamentId: string,
  formData: FormData
) {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const hometown = String(formData.get("hometown") ?? "").trim() || null;
  if (!displayName) return;

  const { supabase } = await loadOwnedTournament(tournamentId);
  const { error } = await supabase.from("participants").insert({
    tournament_id: tournamentId,
    display_name: displayName,
    hometown,
  });
  if (error) throw error;
  revalidatePath(`/tournaments/${tournamentId}/players`);
}

export async function deleteParticipant(
  tournamentId: string,
  participantId: string
) {
  const { supabase } = await loadOwnedTournament(tournamentId);
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId)
    .eq("tournament_id", tournamentId);
  if (error) throw error;
  revalidatePath(`/tournaments/${tournamentId}/players`);
}
