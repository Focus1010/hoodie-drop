"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useHoodieDropGame } from "@/lib/use-hoodie-drop-game";
import { GAME_CONFIG } from "@/lib/game-config";

type SubmitResult = {
  saved: boolean;
  improved: boolean;
  bestScore: number;
} | null;

export default function Game() {
  const { getAccessToken } = usePrivy();
  const [lastResult, setLastResult] = useState<SubmitResult>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const finalScoreRef = useRef(0);

  const handleGameOver = useCallback(
    async (finalScore: number, durationMs: number) => {
      finalScoreRef.current = finalScore;
      setLastResult(null);
      setSubmitError(null);
      setSubmitting(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setSubmitError("Session expired. Log in again to save your score.");
          return;
        }
        const res = await fetch("/api/score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score: finalScore, sessionDurationMs: durationMs }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error ?? "Failed to save score.");
        } else {
          setLastResult(data);
        }
      } catch {
        setSubmitError("Network error while saving score.");
      } finally {
        setSubmitting(false);
      }
    },
    [getAccessToken]
  );

  const { canvasRef, status, score, lives, start, handlePointerMove, setDragActive, canvasWidth, canvasHeight } =
    useHoodieDropGame(handleGameOver);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      handlePointerMove(e.clientX);
    }
    function onUp() {
      setDragActive(false);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [handlePointerMove, setDragActive]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex w-full max-w-[400px] items-center justify-between font-mono text-sm">
        <span className="text-chalk/80">
          SCORE <span className="text-mustard">{String(score).padStart(4, "0")}</span>
        </span>
        <span className="flex items-center gap-1 text-signal-red">
          {Array.from({ length: GAME_CONFIG.STARTING_LIVES }).map((_, i) => (
            <span key={i} className={i < lives ? "opacity-100" : "opacity-20"}>
              ●
            </span>
          ))}
        </span>
      </div>

      <div
        ref={wrapperRef}
        className="relative overflow-hidden rounded-lg border-2 border-chalk/10 bg-asphalt-deep shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_20px_50px_-20px_rgba(0,0,0,0.8)]"
        style={{ width: canvasWidth, maxWidth: "100%", aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
        onPointerDown={(e) => {
          if (status !== "playing") return;
          setDragActive(true);
          handlePointerMove(e.clientX);
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block h-full w-full touch-none"
        />

        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-asphalt-deep/90 px-6 text-center backdrop-blur-sm">
            {status === "idle" && (
              <>
                <p className="font-display text-2xl text-chalk">READY?</p>
                <p className="max-w-[26ch] font-mono text-xs leading-relaxed text-chalk/60">
                  Drag or use ← → to move. Catch coins, dodge the rug bags. Three lives.
                </p>
                <button
                  onClick={start}
                  className="mt-2 rounded bg-mustard px-6 py-3 font-display text-sm tracking-wide text-asphalt-deep transition-transform active:scale-95"
                >
                  START
                </button>
              </>
            )}

            {status === "gameover" && (
              <>
                <p className="font-display text-3xl text-signal-red">RUGGED</p>
                <p className="font-mono text-sm text-chalk/80">
                  FINAL SCORE{" "}
                  <span className="text-mustard">{String(finalScoreRef.current).padStart(4, "0")}</span>
                </p>

                {submitting && (
                  <p className="font-mono text-xs text-chalk/50">saving to ledger…</p>
                )}
                {!submitting && lastResult && (
                  <p className="font-mono text-xs text-chalk/70">
                    {lastResult.improved ? (
                      <span className="text-mustard">new personal best — saved</span>
                    ) : (
                      <span>best score stays at {lastResult.bestScore}</span>
                    )}
                  </p>
                )}
                {!submitting && submitError && (
                  <p className="font-mono text-xs text-signal-red">{submitError}</p>
                )}

                <button
                  onClick={start}
                  className="mt-2 rounded bg-mustard px-6 py-3 font-display text-sm tracking-wide text-asphalt-deep transition-transform active:scale-95"
                >
                  RETRY
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="font-mono text-[11px] text-chalk/40">
        mobile: drag anywhere on the board · desktop: ← → or A / D
      </p>
    </div>
  );
}
