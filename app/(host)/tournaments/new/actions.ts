"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateTournamentSlug } from "@/lib/slug";

export async function createTournament(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const courseName = String(formData.get("course_name") ?? "").trim() || null;
  const courseLocation =
    String(formData.get("course_location") ?? "").trim() || null;
  const startDate = String(formData.get("start_date") ?? "").trim() || null;
  const startTime = String(formData.get("start_time") ?? "").trim() || null;
  const holeCountRaw = Number(formData.get("hole_count"));
  const holeCount: 9 | 18 = holeCountRaw === 9 ? 9 : 18;

  if (!name) redirect("/tournaments/new?err=name_required");

  const slug = generateTournamentSlug(name);

  const { data: tournament, error: insertErr } = await supabase
    .from("tournaments")
    .insert({
      host_id: user.id,
      name,
      slug,
      course_name: courseName,
      course_location: courseLocation,
      start_date: startDate,
      start_time: startTime,
      hole_count: holeCount,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertErr || !tournament) {
    console.error("insert tournament:", insertErr);
    redirect("/tournaments/new?err=create_failed");
  }

  // Seed holes 1..holeCount with default par 4.
  const holes = Array.from({ length: holeCount }, (_, i) => ({
    tournament_id: tournament.id,
    hole_number: i + 1,
    par: 4,
  }));
  const { error: holesErr } = await supabase.from("holes").insert(holes);
  if (holesErr) {
    console.error("seed holes:", holesErr);
  }

  redirect(`/tournaments/${tournament.id}/holes`);
}
