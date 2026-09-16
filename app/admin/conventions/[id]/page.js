"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminSession } from "@/lib/useAdminSession";
import SubmissionList from "./SubmissionsList";
import LeaderBoard from "./LeaderBoard";

import { approvalStatuses } from "@/lib/constants";

export default function AdminConventionPage({ params }) {
  const { session, loading } = useAdminSession();
  const conventionId = params.id;

  const [convention, setConvention] = useState(null);
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tab, setTab] = useState("characters");

  const loadAll = useCallback(async () => {
    const [{ data: conv }, { data: leaderboard }, { data: subs }] = await Promise.all([
      supabase.from("conventions").select("*").eq("id", conventionId).single(),
      supabase.from("players").select("*").eq("id", conventionId).eq("invisible", false).eq("approved", approvalStatuses.APPROVED).order("score", { ascending: false }),
      supabase.from("players").select("*").eq("convention_id", conventionId).order("created_at", { ascending: false }),
    ]);

    setConvention(conv ?? null);
    setLeaderBoard(leaderboard ?? []);
    setSubmissions(subs ?? []);
  }, [conventionId]);

  useEffect(() => {
    if (session) loadAll();
  }, [session, loadAll]);

  if (loading || !session) {
    return <p className="text-parchment/50">Checking credentials…</p>;
  }

  if (!convention) {
    return <p className="text-parchment/50">Loading convention…</p>;
  }

  const tabs = [
    { id: "leaderboard", label: `Leaderboard` },
    { id: "submissions", label: `Submissions (${submissions.length})` },
  ];

  return (
    <div>
      <p className="eyebrow mb-3">Admin · Convention</p>
      <h1 className="mb-8 text-4xl font-bold">{convention.name}</h1>

      <div className="mb-6 flex gap-2 border-b border-parchment/10 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-xs uppercase tracking-wide ${
              tab === t.id ? "text-flare" : "text-parchment/50 hover:text-parchment"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "leaderboard" && <LeaderBoard leaderBoard={leaderBoard}/>
      }
      {tab === "submissions" &&  <SubmissionList submissions={submissions} />}
    </div>
  );
}
