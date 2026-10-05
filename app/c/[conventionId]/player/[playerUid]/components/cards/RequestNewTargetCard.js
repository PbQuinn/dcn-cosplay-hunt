"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { NR_TARGETS } from "@/lib/constants";
import { requestNewTargetAssignment } from "@/app/actions/target";

export function RequestNewTargetCard({ conventionId, hunterId, currentTargetCount = 0, onNewTargets, onNoCharFound }) {
  const [status, setStatus] = useState("idle"); // idle | loading | error

  async function requestNewTargets() {
    setStatus("loading");
    try {
      const maxTargets = typeof NR_TARGETS !== "undefined" ? NR_TARGETS : 3;
      let availableSlots = maxTargets - currentTargetCount;

      if (availableSlots <= 0) {
        onNoCharFound(true);
        setStatus("idle");
        return;
      }

      let latestTargets = [];
      let addedAny = false;

      // Request as many new targets as possible to fill remaining slots
      while (availableSlots > 0) {
        const { newTarget, targets, error } = await requestNewTargetAssignment(
          conventionId,
          hunterId
        );

        if (error) {
          setStatus("error");
          return;
        }

        if (newTarget) {
          addedAny = true;
          latestTargets = targets;
          availableSlots--;
        } else {
          // No more eligible targets available in pool
          break;
        }
      }

      if (addedAny) {
        onNewTargets(latestTargets);
      } else {
        onNoCharFound(true);
      }
    } catch (e) {
      console.error("[RequestNewTargetCard] Error requesting target assignments:", e);
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  const isLoading = status === "loading";

  return (
    <li className="flex w-[76vw] max-w-[320px] flex-none snap-center flex-col justify-between rounded-2xl border border-dashed border-parchment/20 bg-ink-light/40 p-2.5 transition hover:border-parchment/40">
      <button
        type="button"
        onClick={requestNewTargets}
        disabled={isLoading}
        aria-label="Request new targets"
        className="group relative flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-parchment/10 bg-ink/60 transition-all hover:bg-ink hover:border-flare/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {/* Frame Corners */}
        <span className="absolute left-2.5 top-2.5 h-5 w-5 rounded-tl-sm border-l-2 border-t-2 border-parchment/40 transition-colors group-hover:border-flare" />
        <span className="absolute right-2.5 top-2.5 h-5 w-5 rounded-tr-sm border-r-2 border-t-2 border-parchment/40 transition-colors group-hover:border-flare" />
        <span className="absolute bottom-2.5 left-2.5 h-5 w-5 rounded-bl-sm border-b-2 border-l-2 border-parchment/40 transition-colors group-hover:border-flare" />
        <span className="absolute bottom-2.5 right-2.5 h-5 w-5 rounded-br-sm border-b-2 border-r-2 border-parchment/40 transition-colors group-hover:border-flare" />

        {/* Plus Button Icon / Spinner */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-parchment/20 bg-ink-light text-parchment transition-all group-hover:scale-105 group-hover:border-flare group-hover:bg-flare group-hover:text-ink">
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          )}
        </div>

        <span className="mt-4 font-mono text-xs uppercase tracking-wider text-parchment/60 group-hover:text-parchment">
          {isLoading ? "Fetching targets..." : "Request new targets"}
        </span>
      </button>

      <div className="px-1 py-2 text-center">
        <h3 className="font-display text-xl leading-none tracking-wide text-parchment">
          Request new targets
        </h3>
        <p className="mt-1 font-body text-xs text-parchment/60">
          Fill all open target slots with available cosplayers
        </p>
      </div>

      <button
        type="button"
        onClick={requestNewTargets}
        disabled={isLoading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-flare py-3 font-body text-[14.5px] font-semibold text-ink transition hover:bg-flare-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Requesting…
          </>
        ) : (
          <>
            <Plus size={17} strokeWidth={2.25} />
            Request new targets
          </>
        )}
      </button>
    </li>
  );
}