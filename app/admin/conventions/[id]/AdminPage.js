"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAdminSession } from "@/lib/useAdminSession";
import { usePolling } from "@/lib/usePolling";
import { SubmissionList, ApprovalList } from "./PlayerLists";
import LeaderBoard from "./LeaderBoard";
import { getConventionPlayerLists } from "@/app/actions/convention";

export default function AdminDashboard({ convention }) {

    console.log(convention)
  const conventionId = convention.id;
  const { session, loading } = useAdminSession();
  const [storedConvention, setConvention] = useState(null);
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [approval, setApproval] = useState([]);
  const [tab, setTab] = useState("approval");

  const loadAll = useCallback(async () => {
    // Prevent fetching if session/conventionId aren't ready

    const [{ data: leaderboard }, { data: subs }, { data: apps }] = await getConventionPlayerLists(convention.id)

    setConvention(convention ?? null);
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
      {tab === "leaderboard" && <LeaderBoard leaderBoard={leaderBoard} />}

      {/* Display view */}
      <div className="mb-4">
        <Link href={`/admin/conventions/${convention.id}/display`}>
          <button type="button" className="btn-primary">
            Switch to Display view
          </button>
        </Link>
      </div>
    </div>
  );

}
