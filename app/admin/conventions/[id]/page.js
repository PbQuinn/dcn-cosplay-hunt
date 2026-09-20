"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminSession } from "@/lib/useAdminSession";
import { SubmissionList, ApprovalList } from "./PlayerLists";
import LeaderBoard from "./LeaderBoard";
import Link from "next/link";
import { usePolling } from "@/lib/usePolling";

import { approvalStatuses } from "@/lib/constants";

export default function AdminConventionPage({ params }) {
  const { session, loading } = useAdminSession();
  const conventionId = params.id;

  const [convention, setConvention] = useState(null);
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [approval, setApproval] = useState([]);
  const [tab, setTab] = useState("approval");

  const loadAll = useCallback(async () => {
    // Prevent fetching if session/conventionId aren't ready
    if (!session || !conventionId) return;

    const [{ data: conv }, { data: leaderboard }, { data: subs }, { data: apps }] = await Promise.all([
      supabase.from("conventions").select("*").eq("id", conventionId).single(),
      supabase.from("players").select("*").eq("convention_id", conventionId).eq("approved", approvalStatuses.APPROVED).order("score", { ascending: false }),
      supabase.from("players").select("*").eq("convention_id", conventionId).order("created_at", { ascending: false }),
      supabase.from("players").select("*").eq("convention_id", conventionId).eq("approved", approvalStatuses.PENDING).order("created_at", { ascending: false }),
    ]);

    setConvention(conv ?? null);
    setLeaderBoard(leaderboard ?? []);
    setSubmissions(subs ?? []);
    setApproval(apps ?? []);
  }, [conventionId, session]);

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
      <div className="mb-8">
        <Link href="/admin">
          <button type="button" className="btn-primary">
            ← Back to dashboard
          </button>
        </Link>
      </div>

      <p className="eyebrow mb-3">Admin · Convention</p>
      <h1 className="mb-8 text-4xl font-bold">{convention.name}</h1>

      <div className="mb-6 flex gap-2 border-b border-parchment/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
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
      {tab === "leaderboard" && <LeaderBoard leaderBoard={leaderBoard} />}

      {/* Display view */}
      <div className="mb-4">
        <Link href={`/admin/conventions/${conventionId}/display`}>
          <button type="button" className="btn-primary">
            Switch to Display view
          </button>
        </Link>
      </div>
    </div>
  );
}
