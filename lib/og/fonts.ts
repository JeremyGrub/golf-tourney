// Satori (used by next/og) requires TTF/OTF binaries — it does not support woff2.
// Fontsource's jsDelivr CDN serves direct TTF files without the UA dance Google
// Fonts requires, so we fetch from there.

type LoadOpts = {
  /** The @fontsource package name, e.g. "fraunces" */
  slug: string;
  weight: number;
  style?: "normal" | "italic";
  subset?: string;
};

export async function loadFontsourceFont({
  slug,
  weight,
  style = "normal",
  subset = "latin",
}: LoadOpts): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${slug}@latest/${subset}-${weight}-${style}.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font ${slug} ${weight} ${style}: ${res.status}`);
  return res.arrayBuffer();
}
