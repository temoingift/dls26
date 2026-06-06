import strike from "@/assets/cover-strike.jpg";
import crowd from "@/assets/cover-crowd.jpg";
import tactics from "@/assets/cover-tactics.jpg";
import medal from "@/assets/cover-medal.jpg";
import pitch from "@/assets/tournament-default.jpg";
import stadium from "@/assets/auth-bg.jpg";

export type CoverPreset = { key: string; label: string; url: string };

export const COVER_PRESETS: CoverPreset[] = [
  { key: "preset:pitch", label: "Empty Pitch", url: pitch },
  { key: "preset:stadium", label: "Night Stadium", url: stadium },
  { key: "preset:strike", label: "The Strike", url: strike },
  { key: "preset:crowd", label: "Roaring Crowd", url: crowd },
  { key: "preset:tactics", label: "Tactics Board", url: tactics },
  { key: "preset:medal", label: "Gold Medal", url: medal },
];

const PRESET_MAP = new Map(COVER_PRESETS.map((p) => [p.key, p.url]));

/** Resolve a stored cover_image_url value to a renderable image URL. */
export function resolveCoverUrl(value: string | null | undefined): string {
  if (!value) return PRESET_MAP.get("preset:pitch")!;
  if (value.startsWith("preset:")) return PRESET_MAP.get(value) ?? PRESET_MAP.get("preset:pitch")!;
  return value;
}