"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { DEMO_MODE, DEMO_PROFILE } from "@/lib/demo";
import { useHoodieDropGame } from "@/lib/use-hoodie-drop-game";
import { GAME_CONFIG } from "@/lib/game-config";

type SubmitResult = {
  saved: boolean;
  improved: boolean;
  bestScore: number;
} | null;

export default function Game() {
  const { getAccessToken } = useAuth();
  const [lastResult, setLastResult] = useState<SubmitResult>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  // In demo mode the "best" is tracked locally so the saved/best copy feels real.
  const demoBestRef = useRef(DEMO_PROFILE.best_score);

  const handleGameOver = useCallback(
    async (finalScore: number, durationMs: number) => {
      setFinalScore(finalScore);
      setLastResult(null);
      setSubmitError(null);
      setSubmitting(true);

      if (DEMO_MODE) {
        // No network in demo mode: simulate the score-save round trip.
        await new Promise((r) => setTimeout(r, 450));
        const improved = finalScore > demoBestRef.current;
        if (improved) demoBestRef.current = finalScore;
        setLastResult({ saved: true, improved, bestScore: demoBestRef.current });
        setSubmitting(false);
        return;
      }

      try {
        const token = await getAccessToken();
        if (!token) {
          setSubmitError("Session expired. Log in again.");
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
        setSubmitError("Network error.");
      } finally {
        setSubmitting(false);
      }
    },
    [getAccessToken]
  );

  const { canvasRef, status, score, lives, start, handlePointerMove, setDragActive, canvasWidth, canvasHeight } =
    useHoodieDropGame(handleGameOver);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const fitBoxRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState<{ width: number; height: number } | null>(null);

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

  // Fit the fixed-ratio canvas to the largest rectangle that fits the available
  // box on both axes. Pure CSS can't solve this for a portrait ratio inside a
  // portrait container without overflow or distortion, so we measure.
  useEffect(() => {
    const box = fitBoxRef.current;
    if (!box) return;
    const ratio = canvasWidth / canvasHeight;
    const recompute = () => {
      const availW = box.clientWidth;
      const availH = box.clientHeight;
      if (availW === 0 || availH === 0) return;
      const width = Math.min(availW, availH * ratio);
      const height = width / ratio;
      setFit({ width, height });
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(box);
    return () => ro.disconnect();
  }, [canvasWidth, canvasHeight]);

  return (
    <div className="flex h-full w-full flex-col items-center gap-2 overflow-hidden">
      {/* Score strip reads like a receipt line above the product shot. */}
      <div className="flex w-full shrink-0 items-center justify-between border-[3px] border-ink bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone">
        <span>
          Score <span className="text-gold">{String(score).padStart(4, "0")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-bone/50">Lives</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: GAME_CONFIG.STARTING_LIVES }).map((_, i) => (
              <span
                key={i}
                className={`inline-block h-2.5 w-2.5 ${i < lives ? "bg-blaze" : "bg-bone/20"}`}
              />
            ))}
          </span>
        </span>
      </div>

      {/* Product shot. The fit box owns the leftover vertical budget; a measured
          ResizeObserver sizes the canvas to the largest 2:3 rectangle that fits
          both axes, so it never overflows or pushes the nav off-screen. */}
      <div ref={fitBoxRef} className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div
          ref={wrapperRef}
          className="relative overflow-hidden border-[3px] border-ink bg-ink"
          style={fit ? { width: fit.width, height: fit.height } : { aspectRatio: `${canvasWidth} / ${canvasHeight}`, maxHeight: "100%", maxWidth: "100%" }}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/95 px-5 text-center">
            {status === "idle" && (
              <>
                <p className="font-display text-3xl uppercase tracking-[0.04em] text-bone">Ready?</p>
                <p className="max-w-[22ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-bone/55">
                  Drag or use arrows
                </p>
                <button
                  onClick={start}
                  className="mt-1 border-[3px] border-bone bg-blaze px-6 py-2.5 font-display text-base uppercase tracking-[0.08em] text-bone transition-transform active:translate-y-[1px]"
                >
                  Start
                </button>
              </>
            )}

            {status === "gameover" && (
              <>
                <p className="font-display text-4xl uppercase tracking-[0.04em] text-blaze">Game over</p>
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-bone/80">
                  Score <span className="text-gold">{String(finalScore).padStart(4, "0")}</span>
                </p>

                {submitting && (
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-bone/50">saving</p>
                )}
                {!submitting && lastResult && (
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-bone/70">
                    {lastResult.improved ? (
                      <span className="text-gold">new best</span>
                    ) : (
                      <span>best stays {lastResult.bestScore}</span>
                    )}
                  </p>
                )}
                {!submitting && submitError && (
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-blaze">{submitError}</p>
                )}

                <button
                  onClick={start}
                  className="mt-1 border-[3px] border-bone bg-blaze px-6 py-2.5 font-display text-base uppercase tracking-[0.08em] text-bone transition-transform active:translate-y-[1px]"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
