export function zonedDateTimeToUtcIso(localDateTime, timeZone = "Europe/Amsterdam") {
  if (!localDateTime) return null;

  // Expected format from <input type="datetime-local">: "YYYY-MM-DDTHH:mm" (or with ":ss")
  const [datePart, timePart] = localDateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour = 0, minute = 0, second = 0] = (timePart || "").split(":").map(Number);

  // Start with a UTC guess using the same wall-clock numbers
  const utcGuessMs = Date.UTC(year, month - 1, day, hour, minute, second);

  // Format that UTC instant in the target timezone to see what wall-clock time it represents there
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(utcGuessMs));

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const zonedAsUtcMs = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour === "24" ? "0" : map.hour),
    Number(map.minute),
    Number(map.second)
  );

  // Offset = (wall time in target zone) - (UTC guess). Subtracting it yields the true UTC instant.
  const offsetMs = zonedAsUtcMs - utcGuessMs;
  return new Date(utcGuessMs - offsetMs).toISOString();
}