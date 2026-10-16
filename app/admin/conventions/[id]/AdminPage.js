"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useAdminSession } from "@/lib/useAdminSession";
import { usePolling } from "@/lib/usePolling";
import { SubmissionList, ApprovalList } from "./PlayerLists";
import LeaderBoard from "./LeaderBoard";
import { loadPlayerLists } from "@/app/actions/player";
import { Modal } from "@/app/c/[conventionId]/player/[playerUid]/components/ui/Modal";
import { TargetInfoContent } from "@/app/c/[conventionId]/player/[playerUid]/components/modals/TargetInfoModal";

export default function AdminDashboard({ convention }) {
  const conventionId = convention?.id;
  const { session, loading } = useAdminSession();
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [approval, setApproval] = useState([]);
  const [tab, setTab] = useState("approval");
  const [selectedTarget, setSelectedTarget] = useState(null);

  const loadAll = useCallback(async () => {
    if (!conventionId) {
      return;
    }

    try {
      const results = await loadPlayerLists(conventionId);

      const [appsRes, subsRes, leaderboardRes] = results || [{}, {}, {}];

      const apps = appsRes?.data ?? [];
      const subs = subsRes?.data ?? [];
      const leaderboard = leaderboardRes?.data ?? [];

      setLeaderBoard(leaderboard);
      setSubmissions(subs);
      setApproval(apps);
    } catch (err) {
      console.error("❌ [AdminDashboard - loadAll] Unexpected error during fetch:", err);
    }
  }, [conventionId, session]);

  // Log polling activity state changes
  useEffect(() => {
  }, [session, conventionId]);

  // Poll loadAll every 5000ms (5s) only when session exists, otherwise pass null to pause
  usePolling(loadAll, session && conventionId ? 5000 : null);

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

  const handleTabChange = (tabId) => {
    setTab(tabId);
  };

  const handleSelectPlayer = (player) => {
    setSelectedTarget(player);
  };

  const handleCloseModal = () => {
    setSelectedTarget(null);
  };

  const handleUpdateTarget = (updatedPlayer) => {
    setSelectedTarget(updatedPlayer);
  };

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
            onClick={() => handleTabChange(t.id)}
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
          onSelectPlayer={handleSelectPlayer}
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
        <Modal labelledBy="target-info-title" onClose={handleCloseModal}>
          <TargetInfoContent
            target={selectedTarget}
            onClose={handleCloseModal}
            isAdmin={true}
            onUpdateTarget={handleUpdateTarget}
          />
        </Modal>
      )}
    </div>
  );
}