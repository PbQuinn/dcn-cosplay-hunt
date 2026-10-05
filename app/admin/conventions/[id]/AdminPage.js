"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAdminSession } from "@/lib/useAdminSession";
import { usePolling } from "@/lib/usePolling";
import { SubmissionList, ApprovalList } from "./PlayerLists";
import LeaderBoard from "./LeaderBoard";
import { loadPlayerLists } from "@/app/actions/player";
import { Modal, TargetInfoContent } from "@/app/c/[conventionId]/player/[playerUid]/hunterProfile";

export default function AdminDashboard({ convention }) {
  const conventionId = convention.id;
  const { session, loading } = useAdminSession();
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [approval, setApproval] = useState([]);
  const [tab, setTab] = useState("approval");
  const [selectedTarget, setSelectedTarget] = useState(null);

  const loadAll = useCallback(async () => {
    // Prevent fetching if session/conventionId aren't ready

    const [{ data: apps }, { data: subs }, { data: leaderboard }] = await loadPlayerLists(conventionId)

    setLeaderBoard(leaderboard ?? []);
    setSubmissions(subs ?? []);
    setApproval(apps ?? []);
  }, [session]);

  // Poll loadAll every 5000ms (5s) only when session exists, otherwise pass null to pause
  usePolling(loadAll, session ? 5000 : null);

  if (loading || !session) {
    return <p className="text-parchment/50">Checking credentials…</p>;
  }

  if (!convention) {
    return <p className="text-parchment/50">Loading convention…</p>;
  }

  const tabs = [
    { id: "approval", label: `Approval (${approval.length})` },
    { id: "submissions", label: `Submissions (${submissions.length})` },
    { id: "leaderboard", label: `Leaderboard` },
  ];

  return (
    <div>
      {/* Back Button Wrapper */}
      <div className="mt-4 mb-8">
        <Link href="/admin">
          <button type="button" className="btn-primary">
            ← Back to dashboard
          </button>
        </Link>
      </div>

      <p className="eyebrow mb-3">Admin · Convention</p>
      <h1 className="mb-8 text-4xl font-bold">{convention.name}</h1>

      <div className="mb-6 flex gap-2 border-b border-parchment/10 pb-4">
        {tabs.map((t, i) => (
          <button
            key={`${t.id}-${i}`}
            onClick={() => setTab(t.id)}
            className={`font-mono text-xs uppercase tracking-wide ${tab === t.id ? "text-flare" : "text-parchment/50 hover:text-parchment"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "approval" && <ApprovalList submissions={approval} />}
      {tab === "submissions" && <SubmissionList submissions={submissions} />}
      {tab === "leaderboard" && (
        <LeaderBoard
          leaderBoard={leaderBoard}
          onSelectPlayer={(player) => setSelectedTarget(player)}
        />
      )}

      {/* Display view */}
      <div className="mt-10 mb-4">
        <Link href={`/admin/conventions/${conventionId}/display`}>
          <button type="button" className="btn-primary">
            Switch to Display view
          </button>
        </Link>
      </div>

      {/* Target Info Modal for Admin */}
      {selectedTarget && (
        <Modal labelledBy="target-info-title" onClose={() => setSelectedTarget(null)}>
          <TargetInfoContent
            target={selectedTarget}
            onClose={() => setSelectedTarget(null)}
            isAdmin={true}
            onUpdateTarget={(updatedPlayer) => {
              setSelectedTarget(updatedPlayer);
            }}
          />
        </Modal>
      )}
    </div>
  );

}
