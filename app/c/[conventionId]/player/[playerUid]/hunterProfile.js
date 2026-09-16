"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  X,
  Search,
  UserRound,
  CircleCheck,
  CircleAlert,
  ChevronRight,
} from "lucide-react";
import { NR_TARGETS } from "@/lib/constants";
import { checkPlayerCode, getHunterTargetIds, getTargetInformation, requestNewTargetAssignment } from "@/app/actions/target";
import { targetListFromString } from "@/lib/targetList";

function initialsFor(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Small shared pieces — reuse these instead of re-typing the same utility
// strings in every modal. Tweak spacing/color here once and it applies
// everywhere.
// ---------------------------------------------------------------------------
function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-wide text-gold ${className}`}
    >
      {children}
    </p>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="font-body text-[13px] text-parchment/55">{label}</dt>
      <dd className="font-mono text-[13px] text-parchment">{value}</dd>
    </div>
  );
}

function Avatar({ src, name, className = "h-10 w-10 rounded-full text-xs" }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-parchment/10 bg-ink-light ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "Player"}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-mono tracking-wide text-parchment">
          {initialsFor(name)}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal shell — bottom sheet on mobile, centered dialog from sm: up
// ---------------------------------------------------------------------------
function Modal({ onClose, labelledBy, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[86vh] w-full max-w-md overflow-y-auto border border-b-0 border-parchment/10 bg-ink-light px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2.5 rounded-t-3xl sm:rounded-3xl sm:border-b"
      >
        <div className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-parchment/15" />
        {children}
      </div>
    </div>
  );
}

function ModalCloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-parchment/10 bg-ink text-parchment transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50"
    >
      <X size={18} strokeWidth={2.25} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// 4-digit code entry
// ---------------------------------------------------------------------------
function CodeDigitsInput({ value, onChange, disabled, autoFocus }) {
  const refs = useRef([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function handleChange(i, e) {
    const digit = e.target.value.replace(/[^0-9]/g, "").slice(-1);
    const next = value.split("");
    next[i] = digit;
    const joined = next.join("").slice(0, 4);
    onChange(joined);
    if (digit && refs.current[i + 1]) refs.current[i + 1].focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !value[i] && refs.current[i - 1]) {
      refs.current[i - 1].focus();
    }
  }

  return (
    <div className="my-5 flex justify-center gap-3">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1} of 4`}
          className="h-16 w-14 rounded-xl border border-parchment/15 bg-ink text-center font-mono text-3xl text-parchment caret-flare focus:border-flare focus:outline-none focus:ring-2 focus:ring-flare/25 disabled:opacity-50"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Target card — the "viewfinder" signature element
//
// The scanline relies on a `scan` keyframe/animation living in
// tailwind.config.js (see note at the bottom of this file) so it — and its
// timing/color — can be tweaked centrally instead of inline. `motion-safe:`
// means it's skipped entirely under prefers-reduced-motion for free.
// ---------------------------------------------------------------------------
function TargetCard({ target, captured, onOpenInfo, onOpenCapture }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(target?.photoUrl) && !errored;

  return (
    <li className="flex w-[76vw] max-w-[320px] flex-none snap-center flex-col gap-2.5 rounded-2xl border border-parchment/10 bg-ink-light p-2.5">
      <button
        onClick={() => onOpenInfo(target?.app_uid)}
        aria-label={`View details for ${target?.character}`}
        className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-xl bg-ink"
      >
        {showImage ? (
          <img
            src={target?.photoUrl}
            alt={target?.character}
            onError={() => setErrored(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm text-parchment/50">
            {initialsFor(target?.character)}
          </div>
        )}

        <span className="absolute left-2.5 top-2.5 h-5 w-5 rounded-tl-sm border-l-2 border-t-2 border-parchment/85" />
        <span className="absolute right-2.5 top-2.5 h-5 w-5 rounded-tr-sm border-r-2 border-t-2 border-parchment/85" />
        <span className="absolute bottom-2.5 left-2.5 h-5 w-5 rounded-bl-sm border-b-2 border-l-2 border-parchment/85" />
        <span className="absolute bottom-2.5 right-2.5 h-5 w-5 rounded-br-sm border-b-2 border-r-2 border-parchment/85" />
        <span className="motion-safe:animate-scan pointer-events-none absolute inset-x-0 -top-[40%] h-[40%] bg-gradient-to-b from-transparent via-sage/20 to-transparent" />

        {captured && (
          <span className="absolute left-1/2 top-2.5 -translate-x-1/2 rounded-full bg-sage px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-ink">
            CAPTURED
          </span>
        )}
        <span className="absolute inset-x-2.5 bottom-2.5 w-fit rounded-lg bg-ink/60 px-2 py-1 font-mono text-[10.5px] uppercase tracking-wide text-parchment">
          {target?.series || "Unknown series"}
        </span>
      </button>

      <div>
        <h3 className="font-display text-2xl leading-none tracking-wide text-parchment">
          {target?.character || "Unidentified cosplayer"}
        </h3>
        <p className="mt-1 font-body text-sm text-parchment/60">
          {target?.name ? `From ${target?.series}` : "Unidentified series"}
        </p>
      </div>

      <button
        onClick={() => { onOpenCapture(target) }}
        disabled={captured}
        className={
          captured
            ? "flex w-full items-center justify-center gap-2 rounded-xl border border-sage bg-ink py-3 font-body text-[14.5px] font-semibold text-sage"
            : "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-flare py-3 font-body text-[14.5px] font-semibold text-ink transition hover:bg-flare-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-light"
        }
      >
        <Camera size={17} strokeWidth={2.25} />
        {captured ? "Logged" : "Capture"}
      </button>
    </li>
  );
}


function BlankTarget({ conventionId, hunterId, onNewTargets }) {

  const [status, setStatus] = useState("idle"); // idle | loading | error
  async function requestNewTarget() {
    setStatus("loading");
    try {
      const { newTarget, targets } = await requestNewTargetAssignment(conventionId, hunterId);
      if (newTarget) {
        onNewTargets(targets);
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  }

  const [errored, setErrored] = useState(false);

  return (
    <li className="flex w-[76vw] max-w-[320px] flex-none snap-center flex-col gap-2.5 rounded-2xl border border-parchment/10 bg-ink-light p-2.5">
      <button
        onClick={() => console.log("Hi!")}
        aria-label={`Request new`}
        className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-xl bg-ink"
      >
        <div className="flex h-full w-full items-center justify-center font-mono text-sm text-parchment/50">
          ??
        </div>


        <span className="absolute left-2.5 top-2.5 h-5 w-5 rounded-tl-sm border-l-2 border-t-2 border-parchment/85" />
        <span className="absolute right-2.5 top-2.5 h-5 w-5 rounded-tr-sm border-r-2 border-t-2 border-parchment/85" />
        <span className="absolute bottom-2.5 left-2.5 h-5 w-5 rounded-bl-sm border-b-2 border-l-2 border-parchment/85" />
        <span className="absolute bottom-2.5 right-2.5 h-5 w-5 rounded-br-sm border-b-2 border-r-2 border-parchment/85" />
        <span className="motion-safe:animate-scan pointer-events-none absolute inset-x-0 -top-[40%] h-[40%] bg-gradient-to-b from-transparent via-sage/20 to-transparent" />

        <span className="absolute inset-x-2.5 bottom-2.5 w-fit rounded-lg bg-ink/60 px-2 py-1 font-mono text-[10.5px] uppercase tracking-wide text-parchment">
          {"Unknown series"}
        </span>
      </button>

      <div>
        <h3 className="font-display text-2xl leading-none tracking-wide text-parchment">
          {"Unidentified cosplayer"}
        </h3>
        <p className="mt-1 font-body text-sm text-parchment/60">
          {"Identity unconfirmed"}
        </p>
      </div>

      <button
        onClick={requestNewTarget}
        disabled={status === "loading"}
        className={
          "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-flare py-3 font-body text-[14.5px] font-semibold text-ink transition hover:bg-flare-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-light"
        }
      >
        <Search size={17} strokeWidth={2.25} />
        {status === "loading" ? "Requesting…" : "Request new"}
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Modal contents
// ---------------------------------------------------------------------------
function TargetInfoContent({ target, onClose }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(target.photoUrl) && !errored;

  return (
    <div className="relative pt-1">
      <ModalCloseButton onClose={onClose} />

      <div className="mb-4 flex aspect-[16/11] w-full items-center justify-center overflow-hidden rounded-2xl bg-ink">
        {showImage ? (
          <img
            src={target.photoUrl}
            alt={target.character}
            onError={() => setErrored(true)}
            className="h-full w-full object-cover object-center"
            style={{
              display: 'flex',
              width: 'auto',
              height: '120%',
            }}
          />
        ) : (
          <span className="font-mono text-4xl text-parchment/40">
            {initialsFor(target.character)}
          </span>
        )}
      </div>

      <Eyebrow>{target.series || "Unknown series"}</Eyebrow>
      <h2
        id="target-info-title"
        className="mb-3 mt-0.5 font-display text-4xl text-parchment"
      >
        {target.character}
      </h2>
      {target.description && (
        <p className="mb-4 font-body text-[15px] italic leading-relaxed text-parchment/90">
          "{target.description}"
        </p>
      )}

      <p>
        See if you can spot {target.character}! Once you find them, ask for their 4-digit code to score points!
      </p>
    </div>
  );
}

function CaptureContent({ conventionId, target, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | checking | success | error

  async function handleSubmit() {
    setStatus("checking");
    const correct = await checkPlayerCode(conventionId, target.app_uid, code);
    if (correct) {
      setStatus("success");
      onSuccess(target.id);
      setTimeout(onClose, 900);
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="relative pt-1">
      <ModalCloseButton onClose={onClose} />
      <Eyebrow>Log a capture</Eyebrow>
      <h2 id="capture-title" className="mb-2 mt-0.5 font-display text-3xl text-parchment">
        {target.character}
      </h2>
      <p className="font-body text-[13.5px] leading-relaxed text-parchment/60">
        Ask {target.name ? target.name.split(" ")[0] : "the cosplayer"} for the
        4-digit code on their badge and enter it below.
      </p>

      <CodeDigitsInput
        value={code}
        onChange={(v) => {
          setCode(v);
          if (status === "error") setStatus("idle");
        }}
        disabled={status === "checking" || status === "success"}
        autoFocus
      />

      {status === "error" && (
        <p className="mt-1 flex items-center justify-center gap-1.5 font-body text-[13px] text-flare">
          <CircleAlert size={15} /> That code doesn't match. Double-check and try again.
        </p>
      )}
      {status === "success" && (
        <p className="mt-1 flex items-center justify-center gap-1.5 font-body text-[13px] text-sage">
          <CircleCheck size={15} /> Capture logged.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={code.length !== 4 || status === "checking" || status === "success"}
        className="mt-5 w-full cursor-pointer rounded-xl bg-sage py-[15px] font-body text-[15px] font-bold text-ink disabled:cursor-default disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-light"
      >
        {status === "checking" ? "Checking…" : "Submit code"}
      </button>
    </div>
  );
}

function HunterProfileContent({ hunter, score, photoUrl, onClose }) {
  return (
    <div className="relative">
      <ModalCloseButton onClose={onClose} />
      <div className="mb-3.5 flex items-center gap-3.5">
        <Avatar
          src={photoUrl}
          name={hunter.character}
          className="h-16 w-16 rounded-2xl text-lg"
        />
        <div>
          <Eyebrow>{hunter.series || "Invisible"}</Eyebrow>
          <h2
            id="hunter-profile-title"
            className="font-display text-[28px] leading-tight text-parchment"
          >
            {hunter.character || hunter.name}
          </h2>
        </div>
      </div>

      {hunter.description && (
        <p className="mb-4 font-body text-[15px] italic leading-relaxed text-parchment/90">
          "{hunter.description}"
        </p>
      )}

      <dl className="divide-y divide-parchment/10 border-t border-parchment/10">
        <DetailRow label="Hunter" value={hunter.name} />
        <DetailRow label="Badge code" value={hunter.code} />
        <DetailRow label="Score" value={score} />
        <DetailRow label="Contact" value={hunter.contact || "—"} />
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top mission bar
// ---------------------------------------------------------------------------
function MissionBar({ hunter, score, photoUrl, onOpenProfile }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-parchment/10 bg-ink/90 px-4 pb-2.5 pt-[calc(10px+env(safe-area-inset-top))] backdrop-blur-md">
      <button
        onClick={onOpenProfile}
        aria-label="Open your hunter profile"
        className="flex cursor-pointer items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50"
      >
        <Avatar
          src={photoUrl}
          name={hunter?.character}
          className="h-9 w-9 rounded-full text-[11px]"
        />
        <span className="rounded-lg border border-parchment/10 bg-ink-light px-2.5 py-1 font-mono text-[15px] tracking-wide text-parchment">
          Your code: {hunter?.code || "----"}
        </span>
      </button>

      <div className="ml-auto flex flex-col items-end leading-none">
        <span className="mb-0.5 font-mono text-[9.5px] uppercase tracking-widest text-parchment/50">
          Score
        </span>
        <span className="font-mono text-xl text-sage">{score}</span>
      </div>

      <button
        onClick={onOpenProfile}
        aria-label="Your details"
        className="flex cursor-pointer items-center gap-0.5 rounded-full border border-parchment/10 bg-ink-light px-2.5 py-2 text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50"
      >
        <UserRound size={16} strokeWidth={2.25} />
        <ChevronRight size={14} strokeWidth={2.25} />
      </button>
    </header>
  );
}

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

  function handleCaptureSuccess(conventionId, hunterId, targetId) {

    setCapturedIds((prev) => new Set(prev).add(targetId));
    setScore((s) => s + 1);
  }

  const blanksCount = Math.max(0, NR_TARGETS - currentTargets.length);
  const displayTargets = [
    ...currentTargets,
    ...Array.from({ length: blanksCount }, () => undefined),
  ];

  // Same route used for target photos, called once and reused everywhere
  // this hunter's own photo appears (mission bar avatar + profile modal)
  // instead of resolving a new signed URL per occurrence.
  const hunterPhotoUrl =
    convention?.id && hunter?.app_uid
      ? `/c/${convention.id}/player/${hunter.app_uid}/photo`
      : null;

  if (!hunter) {
    return (
      <div className="bg-grain flex min-h-screen items-center justify-center bg-ink bg-repeat px-10 text-center">
        <p className="font-body text-parchment/60">
          No hunter profile found for this device. Check in at the
          registration desk to get your badge and target list.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-grain relative mx-auto min-h-screen max-w-[560px] bg-ink bg-repeat font-body text-parchment">
      <MissionBar
        hunter={hunter}
        score={score}
        photoUrl={hunterPhotoUrl}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="pb-10 pt-4.5">
        <p className="mb-3.5 px-4 font-mono text-[11px] uppercase tracking-wide text-parchment/50">
          {convention?.name ? `${convention.name}` : "Convention Info Unavailable"}
        </p>

        <ul
          role="list"
          className="m-0 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2.5 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayTargets.map((target, i) => {
            // console.log(setInfoTargetId);
            return target ?
              <TargetCard
                key={`${target.app_uid}-${i}`}
                target={target}
                captured={capturedIds.has(target.app_uid)}
                onOpenInfo={setInfoTargetId}
                onOpenCapture={setCaptureTarget}
              /> :
              <BlankTarget
                key={`blank-${i}`}
                conventionId={convention?.id}
                hunterId={hunter?.app_uid}
                onNewTargets={setCurrentTargets}
              />
          })}
        </ul>
      </main>

      {infoTargetId && (

        <Modal labelledBy="target-info-title" onClose={() => setInfoTargetId(null)}>
          <TargetInfoContent target={displayTargets.find((t) => t.app_uid === infoTargetId)} onClose={() => setInfoTargetId(null)} />
        </Modal>
      )}

      {captureTarget && (
        <Modal labelledBy="capture-title" onClose={() => setCaptureTarget(null)}>
          <CaptureContent
            conventionId={convention.id}
            target={captureTarget}
            onClose={() => setCaptureTarget(null)}
            onSuccess={handleCaptureSuccess}
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
          />
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// tailwind.config.js — add this to theme.extend so the target-card scanline
// (`motion-safe:animate-scan` above) has a real animation to reference. This
// is the one bit of motion in the page; tune duration/easing here, centrally,
// rather than hunting through component code.
//
//   extend: {
//     keyframes: {
//       scan: {
//         "0%": { top: "-40%" },
//         "100%": { top: "100%" },
//       },
//     },
//     animation: {
//       scan: "scan 3.4s linear infinite",
//     },
//   },
// ---------------------------------------------------------------------------
