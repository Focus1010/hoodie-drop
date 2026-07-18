"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SketchPanel, SketchShell } from "@/components/SketchShell";
import { DEMO_LEADERBOARD, DEMO_MODE, DEMO_USER } from "@/lib/demo";

type Row = {
  x_username: string;
  wallet_address: string;
  best_score: number;
  updated_at: string;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (DEMO_MODE) {
      // Mock data, sorted like the real endpoint. Small delay to show loading.
      const t = window.setTimeout(() => {
        if (cancelled) return;
        setRows([...DEMO_LEADERBOARD].sort((a, b) => b.best_score - a.best_score));
        setError(null);
      }, 350);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Failed to load leaderboard.");
          return;
        }
        setRows(data.players ?? []);
        setError(null);
      } catch {
        if (!cancelled) setError("Failed to load leaderboard.");
      }
    }

    loadLeaderboard();
    const interval = window.setInterval(loadLeaderboard, 5000);
    const onFocus = () => loadLeaderboard();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  return (
    <SketchShell
      activeTab="leaderboard"
      title="Ranks"
      headerRight={
        DEMO_MODE ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40">demo</span>
        ) : (
          <Link
            href="/api/leaderboard/export"
            className="border-[3px] border-bone px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/80 hover:bg-bone hover:text-ink"
          >
            export csv
          </Link>
        )
      }
    >
      <SketchPanel eyebrow="Sold-out list" title="Top 10" className="flex-1 min-h-0">
        {error && <p className="text-center font-mono text-xs uppercase tracking-[0.14em] text-blaze">{error}</p>}

        {!error && rows === null && (
          <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-concrete">loading</p>
        )}

        {!error && rows !== null && rows.length === 0 && (
          <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-concrete">no scores yet</p>
        )}

        {!error && rows !== null && rows.length > 0 && (
          <ol className="flex flex-col gap-1.5">
            {rows.slice(0, 10).map((row, i) => {
              const isMe = DEMO_MODE && row.wallet_address === DEMO_USER.wallet_address;
              const podium = i < 3;
              return (
                <li
                  key={row.wallet_address}
                  data-me={isMe || undefined}
                  className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-[3px] border-ink bg-bone px-2.5 py-2 data-[me]:bg-blaze/12"
                >
                  <div
                    className={`flex h-9 items-center justify-center font-display text-lg leading-none ${
                      podium ? "bg-blaze text-bone" : "bg-ink text-bone"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-display text-base uppercase leading-none tracking-[0.01em] text-ink">
                      <span className="truncate">@{row.x_username}</span>
                      {isMe && (
                        <span className="shrink-0 bg-ink px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-bone">
                          you
                        </span>
                      )}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-concrete">
                      {shortenAddress(row.wallet_address)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl leading-none text-ink">{row.best_score}</p>
                    <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-concrete">pts</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </SketchPanel>
    </SketchShell>
  );
}
