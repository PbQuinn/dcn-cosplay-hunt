export function formatNumberDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function formatTextDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCompactTime(dateString) {
  new Date(dateString).toLocaleTimeString("en-GB", {
    timeZone: "Europe/Amsterdam",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}