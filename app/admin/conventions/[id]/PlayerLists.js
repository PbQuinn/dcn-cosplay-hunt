"use client";

import { useState } from "react";
import { Modal, TargetInfoContent } from "@/app/c/[conventionId]/player/[playerUid]/hunterProfile";

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
  const [selectedTarget, setSelectedTarget] = useState(null);

  if (submissions.length === 0) {
    return <p className="text-sm text-parchment/50">No cosplay entries logged yet.</p>;
  }

  return (
    <>
      <ul className="card-shell max-h-96 space-y-2 overflow-y-auto">
        {submissions.map((s) => (
          <li
            key={s.id}
            onClick={() => setSelectedTarget(s)}
            className="flex cursor-pointer justify-between border-b border-parchment/10 pb-2 text-sm transition-colors hover:bg-parchment/5 last:border-0"
          >
            <span>
              <strong>{s.name}</strong>{" "}
              {!s.invisible && (
                <>
                  <span className="text-parchment/60">as {s.character}</span>{" "}
                </>
              )}
              <span className="text-parchment/60">with a score of {s.score}</span>
            </span>
            <span className="font-mono text-[10px] text-parchment/30">
              Created at {formatDate(s.created_at)}
            </span>
          </li>
        ))}
      </ul>

      {/* Target Info Modal */}
      {selectedTarget && (
        <Modal labelledBy="target-info-title" onClose={() => setSelectedTarget(null)}>
          <TargetInfoContent
            target={selectedTarget}
            onClose={() => setSelectedTarget(null)}
          />
        </Modal>
      )}
    </>
  );
}

export function ApprovalList({ submissions }) {
  const [selectedTarget, setSelectedTarget] = useState(null);

  if (submissions.length === 0) {
    return <p className="text-sm text-parchment/50">No hunters need to be approved.</p>;
  }

  return (
    <>
      <ul className="card-shell max-h-96 space-y-2 overflow-y-auto">
        {submissions.map((s) => (
          <li
            key={s.id}
            onClick={() =>
              setSelectedTarget({
                ...s,
                name: s.submitter_name,
                character: s.character_name,
              })
            }
            className="flex cursor-pointer justify-between border-b border-parchment/10 pb-2 text-sm transition-colors hover:bg-parchment/5 last:border-0"
          >
            <span>
              <strong>{s.submitter_name}</strong>{" "}
              {!s.invisible && (
                <>
                  <span className="text-parchment/60">as {s.character}</span>{" "}
                </>
              )}
            </span>
            <span className="font-mono text-[10px] text-parchment/30">
              Created at {formatDate(s.created_at)}
            </span>
          </li>
        ))}
      </ul>

      {/* Target Info Modal */}
      {selectedTarget && (
        <Modal labelledBy="target-info-title" onClose={() => setSelectedTarget(null)}>
          <TargetInfoContent
            target={selectedTarget}
            onClose={() => setSelectedTarget(null)}
          />
        </Modal>
      )}
    </>
  );
}