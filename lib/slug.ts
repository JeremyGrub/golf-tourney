import { randomBytes } from "crypto";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function generateTournamentSlug(name: string): string {
  const base = slugify(name) || "tournament";
  const suffix = randomBytes(3).toString("hex"); // 6 chars
  return `${base}-${suffix}`;
}
