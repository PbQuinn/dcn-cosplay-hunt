export function initialsFor(name) {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
        ? parts[0].slice(0, 2).toUpperCase()
        : (parts[0][0] + parts[1][0]).toUpperCase();
}