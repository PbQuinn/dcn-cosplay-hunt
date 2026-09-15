"use client";

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function SubmissionList({ submissions }) {
  if (submissions.length === 0) {
    return <p className="text-sm text-parchment/50">No cosplay entries logged yet.</p>;
  }

  return (
    <ul className="card-shell max-h-96 space-y-2 overflow-y-auto">
      {submissions.map((s) => (
        <li key={s.id} className="flex justify-between border-parchment/10 pb-2 text-sm last:border-0">
          <span>
            <strong>{s.name}</strong>{" "}
            <span className="text-parchment/60">as {s.character}</span>{" "}
            <span className="text-parchment/60">with a score of {s.score}</span>
          </span>
          {/* Dotted Leader Line */}
          <span className="mb-1 flex-1 border-b border-dotted border-parchment/30" />
          <span className="font-mono text-[10px] text-parchment/30">
            {formatDate(s.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ApprovalList({ submissions }) {
  if (submissions.length === 0) {
    return <p className="text-sm text-parchment/50">No hunters need to be approved.</p>;
  }

  return (
    <ul className="card-shell max-h-96 space-y-2 overflow-y-auto">
      {submissions.map((s) => (
        <li key={s.id} className="flex justify-between border-parchment/10 pb-2 text-sm last:border-0">
          <span>
            <strong>{s.submitter_name}</strong>{" "}
            <span className="text-parchment/60">as {s.character_name}</span>
          </span>
          {/* Dotted Leader Line */}
          <span className="mb-1 flex-1 border-b border-dotted border-parchment/30" />
          <span className="font-mono text-[10px] text-parchment/30">
            {formatDate(s.created_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}