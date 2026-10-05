"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, Camera, Check } from "lucide-react";
import { Eyebrow } from "../ui/Eyebrow";
import { CodeDigitsInput } from "../CodeDigitsInput";
import { ModalCloseButton } from "../ui/Modal";
import { checkPlayerCode } from "@/app/actions/target";

export function CaptureContent({ conventionId, hunter, target, onClose, onSuccess }) {
    const [code, setCode] = useState("");
    const [status, setStatus] = useState("idle"); // idle | checking | success | error

    async function handleSubmit() {
        if (code.length !== 4 || status === "checking" || status === "success") return;

        setStatus("checking");
        const correct = await checkPlayerCode(conventionId, target.app_uid, code);
        if (correct) {
            setStatus("success");
            onSuccess(conventionId, hunter.app_uid, target.app_uid);
            setTimeout(() => {
                onClose();
            }, 900);
        } else {
            setStatus("error");
        }
    }

    const isCaptured = status === "success";
    const isDisabled = code.length !== 4 || status === "checking";

    return (
        <div className="relative pt-1">
            <ModalCloseButton onClose={onClose} />
            <Eyebrow>Log a capture</Eyebrow>
            <h2 id="capture-title" className="mb-2 mt-0.5 font-display text-3xl text-parchment">
                {target.character}
            </h2>
            <p className="font-body text-[13.5px] leading-relaxed text-parchment/60">
                Ask {target.character ? target.character : "the cosplayer"} for their
                4-digit code and enter it below to capture them.
            </p>

            <CodeDigitsInput
                value={code}
                onChange={(v) => {
                    setCode(v);
                    if (status === "error") setStatus("idle");
                }}
                onSubmit={handleSubmit}
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

            <CaptureButton
                captured={isCaptured}
                disabled={isDisabled}
                onClick={handleSubmit}
                className="mt-5"
            />
        </div>
    );
}

export function CaptureButton({
    captured,
    onClick,
    disabled = false,
    className = "",
    label = "Capture",
    capturedLabel = "Logged"
}) {
    const isCaptured = Boolean(captured);
    const isDisabled = isCaptured || disabled;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-body text-[14.5px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-light ${isCaptured
                ? "cursor-default border border-sage/40 bg-sage/10 text-sage opacity-90"
                : "cursor-pointer bg-flare text-ink hover:bg-flare-dim active:scale-[0.98] focus-visible:ring-flare/50 disabled:cursor-default disabled:opacity-45"
                } ${className}`}
        >
            {isCaptured ? (
                <>
                    <Check size={17} strokeWidth={2.25} />
                    <span>{capturedLabel}</span>
                </>
            ) : (
                <>
                    <Camera size={17} strokeWidth={2.25} />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}