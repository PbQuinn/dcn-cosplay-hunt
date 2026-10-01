export function formatNumber(value) {
  // Strip all non-numeric characters and limit to 10 digits
  const raw = String(value ?? "").replace(/\D/g, "").slice(0, 10);

  // Apply formatting progressively based on length
  if (raw.length > 6) {
    return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
  }
  if (raw.length > 3) {
    return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  }
  return raw;
}