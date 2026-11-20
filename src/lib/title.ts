/** "Roya Real Estate - Luxury Brand Identity" → ["Roya Real Estate", "Luxury Brand Identity"]. */
export function splitTitle(title: string): [string, string] {
  const m = title.split(/\s+[-–—]\s+/);
  if (m.length < 2) return [title, ''];
  return [m[0], m.slice(1).join(' — ')];
}
