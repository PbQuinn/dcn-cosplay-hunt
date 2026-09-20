"use client";

export default function LeaderBoard({ leaderBoard = [], displayAmount }) {
  // Determine total rows to show: either displayAmount or the actual data length
  const totalRows = displayAmount ? displayAmount : leaderBoard.length;

  if (totalRows === 0) {
    return <p className="text-sm text-parchment/50">No cosplay entries logged yet.</p>;
  }

  // Create an array spanning the total count desired
  const rows = Array.from({ length: totalRows }, (_, index) => {
    return leaderBoard[index] || null; // Return real entry or null for placeholder
  });

  return (
    <ul className="card-shell max-h-96 space-y-2 overflow-y-auto">
      {rows.map((entry, index) => {
        const rank = index + 1;

        return (
          <li key={entry?.id ?? `placeholder-${rank}`} className="flex items-baseline gap-2 text-sm">
            {/* Rank & Name as Character (or empty placeholder rank) */}
            <span className="shrink-0 font-mono">
              <span className="font-bold text-flare">{rank}.</span>{" "}
              {entry ? (
                <>
                  <strong>{entry.name}</strong>{" "}
                  {!entry.invisible && (
                    <span className="text-parchment/60">as {entry.character}</span>
                  )}
                </>
              ) : null}
            </span>

            {/* Dotted Leader Line */}
            <span className="mb-1 flex-1 border-b border-dotted border-parchment/30" />

            {/* Score */}
            <span className="shrink-0 font-mono text-xs text-parchment/80 font-extrabold text-flare">
              {entry ? entry.score : 0}
            </span>
          </li>
        );
      })}
    </ul>
  );
}