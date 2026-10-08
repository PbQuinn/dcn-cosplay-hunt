"use client";

import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { NR_TARGETS, REFRESH_COOLDOWN_MILLISECONDS } from "@/lib/constants";
import { performCapture, requestFreshTargetAssignment } from "@/app/actions/target";
import { updatePlayerLastRefresh } from "@/app/actions/player";

// UI Components & Cards
import { MissionBar } from "./MissionBar";
import { TargetCard } from "./components/cards/TargetCard";
import { RequestNewTargetCard } from "./components/cards/RequestNewTargetCard";

// Modals & Shells
import { Modal } from "./components/ui/Modal";
import { TargetInfoContent } from "./components/modals/TargetInfoModal";
import { CaptureContent } from "./components/modals/CaptureModal";
import { HunterProfileContent } from "./components/modals/HunterProfileModal";
import { NoCharFoundModal } from "./components/modals/NoCharFoundModal";
import { RefreshAllContent } from "./components/modals/RefreshAllModal";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function HunterPage({ convention, hunter, targets }) {
  const [infoTargetId, setInfoTargetId] = useState(null);
  const [captureTarget, setCaptureTarget] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [capturedIds, setCapturedIds] = useState(() => new Set());
  const [score, setScore] = useState(hunter?.score ?? 0);
  const [currentTargets, setCurrentTargets] = useState(targets);
  const [showNoCharFoundModal, setShowNoCharFoundModal] = useState(false);
  const [refreshAll, setRefreshAll] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track the last refresh timestamp locally so UI updates immediately
  const [lastRefreshTime, setLastRefreshTime] = useState(
    hunter?.last_refresh ? new Date(hunter.last_refresh).getTime() : null
  );

  // Track remaining seconds for cooldown countdown
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);

  // Sync state if hunter prop updates externally
  useEffect(() => {
    if (hunter?.last_refresh) {
      const parsedTime = new Date(hunter.last_refresh).getTime();
      setLastRefreshTime(parsedTime);
    }
  }, [hunter?.last_refresh]);

  // Countdown timer effect
  useEffect(() => {
    if (!lastRefreshTime) {
      setTimeLeftSeconds(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const nextAvailableTime = lastRefreshTime + REFRESH_COOLDOWN_MILLISECONDS;
      const diffMs = nextAvailableTime - now;
      const computedSeconds = diffMs <= 0 ? 0 : Math.ceil(diffMs / 1000);

      if (diffMs <= 0) {
        setTimeLeftSeconds(0);
      } else {
        setTimeLeftSeconds(computedSeconds);
      }
    };

    calculateTimeLeft(); // Run immediately

    const interval = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [lastRefreshTime]);

  // Helper to format remaining seconds as MM:SS
  const formatCountdown = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  async function handleCaptureSuccess(conventionId, hunterId, targetId) {
    const startTime = performance.now();

    try {
      // 1. Destructure targets (full DB array) and score
      const { targets, score, error } = await performCapture(
        conventionId,
        hunterId,
        targetId
      );

      const duration = (performance.now() - startTime).toFixed(2);

      if (error) {
        console.error(`[handleCaptureSuccess] performCapture failed (${duration}ms):`, error);
        return;
      }

      // 2. Mark target as captured in local tracking set
      setCapturedIds((prev) => new Set(prev).add(targetId));

      // 3. Update score state
      setScore(score);

      // 4. Overwrite local UI state with exact DB target order
      setCurrentTargets(targets);

    } catch (err) {
      console.error("[handleCaptureSuccess] Unexpected exception thrown:", err);
    }
  }

  useEffect(() => {
    // Only start a timer if there is remaining cooldown time
    if (timeLeftSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0; // Hits 0 and triggers automatic switch back to "Request new targets"
        }
        return prevTime - 1;
      });
    }, 1000);

    // Clean up timer on unmount or state change
    return () => clearInterval(interval);
  }, [timeLeftSeconds]);

  async function handleTargetRefresh(conventionId, hunterId) {
    // Generate a short unique ID for this invocation to trace parallel or rapid consecutive calls
    const requestId = Math.random().toString(36).substring(2, 8);

    // Reset UI State
    setIsRefreshing(true);
    setRefreshAll(null);
    setCurrentTargets([]);

    const nowMs = Date.now();
    setLastRefreshTime(nowMs);

    try {
      const newTargets = await requestFreshTargetAssignment(conventionId, hunterId);
      const nowIso = new Date().toISOString();

      // Secondary non-blocking operation: Sync timestamp to backend
      try {
        await updatePlayerLastRefresh(hunterId, nowIso);
      } catch (err) {
        console.error("%c[API] Post-resolve updatePlayerLastRefresh failed:", "color: #ef4444; font-weight: bold;", err);
        console.error("%c[API] Error context:", "color: #f87171;", { hunterId, nowIso, requestId });
      }

      // Set final targets in state
      setCurrentTargets(newTargets);

    } catch (error) {
      console.error("%c[Handler] Error during target refresh:", "color: #ef4444; font-weight: bold;", error);
      console.error("%c[Handler] Failed with params:", "color: #f87171;", { conventionId, hunterId, requestId });
    } finally {
      setIsRefreshing(false);
    }
  }

  // Same route used for target photos, called once and reused everywhere
  // this hunter's own photo appears (mission bar avatar + profile modal)
  // instead of resolving a new signed URL per occurrence.
  const [hunterPhotoUrl, setHunterPhotoUrl] = useState(
    convention?.id && hunter?.app_uid
      ? `/c/${convention.id}/player/${hunter.app_uid}/photo`
      : null
  );

  const isCooldownActive = timeLeftSeconds > 0;
  const currentInfoTarget = currentTargets.find((t) => t?.app_uid === infoTargetId);

  if (!hunter) {
    return (
      <div className="bg-grain flex items-center justify-center bg-ink bg-repeat px-10 text-center">
        <p className="font-body text-parchment/60">
          No hunter profile found for this device. Check in at the
          registration desk to get your badge and target list.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grain relative mx-auto max-w-[560px] bg-ink bg-repeat font-body text-parchment">
      <MissionBar
        hunter={hunter}
        score={score}
        photoUrl={hunterPhotoUrl}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="pb-1 pt-4.5">
        <ul
          role="list"
          className="m-0 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2.5 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isRefreshing ? (
            <div className="w-full flex flex-col items-center justify-center p-8 space-y-3 min-h-[200px]">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-600">Waiting for new targets...</p>
            </div>
          ) : (
            <>
              {/* Render assigned target cards */}
              {currentTargets.map((target, i) => (
                <TargetCard
                  key={`${target.app_uid}-${i}`}
                  target={target}
                  captured={capturedIds.has(target.app_uid)}
                  onOpenInfo={setInfoTargetId}
                  onOpenCapture={setCaptureTarget}
                />
              ))}

              {/* Render a single Request New Target card if under max targets limit */}
              {currentTargets.length < NR_TARGETS && (
                <RequestNewTargetCard
                  conventionId={convention?.id}
                  hunterId={hunter?.app_uid}
                  onNewTargets={setCurrentTargets}
                  onNoCharFound={setShowNoCharFoundModal}
                />
              )}
            </>
          )}
        </ul>

        <button
          onClick={() => {
            if (!isCooldownActive) {
              setRefreshAll(true);
            }
          }}
          disabled={isCooldownActive}
          className={`flex w-[70%] mx-auto items-center justify-center gap-3 rounded-xl border py-3 font-body text-[14.5px] font-semibold transition-all ${isCooldownActive
            ? "border-subtle/30 bg-ink/50 text-parchment/40 cursor-not-allowed opacity-60"
            : "border-subtle bg-ink text-subtle hover:bg-subtle/10 cursor-pointer"
            }`}
        >
          <RefreshCcw size={17} strokeWidth={2.25} className={isCooldownActive ? "opacity-40" : ""} />
          {isCooldownActive ? formatCountdown(timeLeftSeconds) : "Request new targets"}
        </button>
      </main>

      {infoTargetId && currentInfoTarget && (
        <Modal
          labelledBy="target-info-title"
          onClose={() => setInfoTargetId(null)}
        >
          <TargetInfoContent
            target={currentInfoTarget}
            captured={capturedIds.has(currentInfoTarget.app_uid)}
            onOpenCapture={setCaptureTarget}
            onClose={() => setInfoTargetId(null)}
          />
        </Modal>
      )}

      {captureTarget && (
        <Modal
          labelledBy="capture-title"
          onClose={() => setCaptureTarget(null)}
        >
          <CaptureContent
            conventionId={convention.id}
            hunter={hunter}
            target={captureTarget}
            onClose={() => setCaptureTarget(null)}
            onSuccess={(...args) => {
              handleCaptureSuccess(...args);
            }}
          />
        </Modal>
      )}

      {profileOpen && (
        <Modal labelledBy="hunter-profile-title" onClose={() => setProfileOpen(false)}>
          <HunterProfileContent
            hunter={hunter}
            score={score}
            photoUrl={hunterPhotoUrl}
            onClose={() => setProfileOpen(false)}
            onPhotoDeleted={() => setHunterPhotoUrl(null)}
          />
        </Modal>
      )}

      {showNoCharFoundModal && (
        <Modal labelledBy="capture-title" onClose={() => setCaptureTarget(null)}>
          <NoCharFoundModal onClose={setShowNoCharFoundModal} />
        </Modal>
      )}

      {refreshAll && (
        <Modal
          labelledBy="target-info-title"
          onClose={() => {
            setRefreshAll(null);
          }}
        >
          <RefreshAllContent
            onClose={() => {
              setRefreshAll(null);
            }}
            onConfirm={() => {
              handleTargetRefresh(convention.id, hunter.app_uid);
            }}
          />
        </Modal>
      )}
    </div>
  );
}