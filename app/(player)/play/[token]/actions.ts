"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitScore(
  token: string,
  holeNumber: number,
  strokes: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isInteger(holeNumber) || holeNumber < 1 || holeNumber > 18) {
    return { ok: false, error: "invalid_hole" };
  }
  if (!Number.isInteger(strokes) || strokes < 1 || strokes > 20) {
    return { ok: false, error: "invalid_strokes" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_score", {
    p_token: token,
    p_hole_number: holeNumber,
    p_strokes: strokes,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/play/${token}`);
  revalidatePath(`/play/${token}/hole/${holeNumber}`);
  return { ok: true };
}
