"use client";

import { useState } from "react";
import { Modal, TargetInfoContent } from "@/app/c/[conventionId]/player/[playerUid]/hunterProfile";
import { approvalStatusLabels } from "@/lib/constants";

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

// Helper to construct full target object with computed photo URL
function normalizeTarget(item) {
  const photoUrl =
    item.convention_id && item.app_uid
      ? `/c/${item.convention_id}/player/${item.app_uid}/photo`
      : item.photoUrl || null;

  return {
    ...item,
    photoUrl,
  };
}

export function SubmissionList({ submissions }) {
  const [selectedTarget, setSelectedTarget] = useState(null);

  if (submissions.length === 0) {
    return <p className="text-sm text-parchment/50">No cosplay entries logged yet.</p>;
  }

 const getStatusBadgeClass = (status) => {
  switch (status) {
    case "APPROVED":
      return "bg-sage/20 text-sage border-sage/40";
    case "REJECTED":
      return "bg-flare/20 text-flare border-flare/40";
    case "PENDING":
    default:
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }
};

  return (
    <>
      <ul className="card-shell max-h-96 space-y-2 overflow-y-auto">
        {submissions.map((s) => (
          <li
            key={s.id}
            onClick={() => setSelectedTarget(normalizeTarget(s))}
            className="flex cursor-pointer justify-between border-b border-parchment/10 pb-2 text-sm transition-colors hover:bg-parchment/5 last:border-0"
          >
            <span>
              <strong>{s.name}</strong>{" "}
              <span className="text-parchment/60">
                {!s.invisible ? ` as ${s.character}` : " (Invisible)"}
              </span>{" "}
              <span className="text-parchment/60">[score: {s.score}]</span>{" "}
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                  approvalStatusLabels[s.approved]
                )}`}
              >
                {approvalStatusLabels[s.approved] || s.approved || "Pending"}
              </span>
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
            isAdmin={true}
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
            onClick={() => setSelectedTarget(normalizeTarget(s))}
            className="flex cursor-pointer justify-between border-b border-parchment/10 pb-2 text-sm transition-colors hover:bg-parchment/5 last:border-0"
          >
            <span>
              <strong>{s.name}</strong>{" "}
              <span className="text-parchment/60">
                {!s.invisible ? ` as ${s.character}` : " (Invisible)"}
              </span>{" "}
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
            isAdmin={true}
            closeOnAction={true}
          />
        </Modal>
      )}
    </>
  );
}