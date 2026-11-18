"use client";

export default function LeaderBoard({
  leaderBoard = [],
  displayAmount,
  onSelectPlayer,
  textSize = "text-sm",
  isDisplay = false,
}) {
  const totalRows = displayAmount ? displayAmount : leaderBoard.length;

  if (totalRows === 0) {
    return <p className={`text-parchment/50 ${textSize}`}>No cosplay entries logged yet.</p>;
  }

  const rows = Array.from({ length: totalRows }, (_, index) => {
    return leaderBoard[index] || null;
  });

  return (
    <ul
      className={`card-shell bg-parchment/5 p-3 ${isDisplay
          ? "w-full space-y-1.5 overflow-visible"
          : "max-h-96 space-y-2.5 overflow-y-auto"
        }`}
    >
      {rows.map((entry, index) => {
        const rank = index + 1;
        const isClickable = Boolean(entry && onSelectPlayer);

        return (
          <li
            key={entry?.id ?? `placeholder-${rank}`}
            onClick={() => isClickable && onSelectPlayer(entry)}
            className={`flex items-baseline gap-2 ${textSize} transition-colors ${isClickable
                ? "cursor-pointer hover:bg-parchment/10 rounded-lg p-1.5 -mx-1.5"
                : ""
              }`}
          >
            {/* Rank & Name as Character */}
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
            <span className="shrink-0 font-mono font-extrabold text-flare">
              {entry ? entry.score : 0}
            </span>
          </li>
        );
      })}
    </ul>
  );
}