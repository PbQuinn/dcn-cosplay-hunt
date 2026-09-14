"use client";

export function SubmissionList({ submissions }) {
  if (submissions.length === 0) {
    return <p className="text-sm text-parchment/50">No cosplay entries logged yet.</p>;
  }

  return (
    <ul className="card-shell max-h-96 space-y-2 overflow-y-auto">
      {submissions.map((s) => (
        <li key={s.id} className="flex justify-between border-b border-parchment/10 pb-2 text-sm last:border-0">
          <span>
            <strong>{s.submitter_name}</strong>{" "}
            <span className="text-parchment/60">as {s.character_name}</span>
          </span>
          <span className="font-mono text-[10px] text-parchment/30">
            {new Date(s.created_at).toLocaleDateString()}
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
        <li key={s.id} className="flex justify-between border-b border-parchment/10 pb-2 text-sm last:border-0">
          <span>
            <strong>{s.submitter_name}</strong>{" "}
            <span className="text-parchment/60">as {s.character_name}</span>
          </span>
          <span className="font-mono text-[10px] text-parchment/30">
            {new Date(s.created_at).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
}