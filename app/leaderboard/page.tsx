"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  x_username: string;
  wallet_address: string;
  best_score: number;
  updated_at: string;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setRows(data.players ?? []))
      .catch(() => setError("Failed to load leaderboard."));
  }, []);

  return (
    <div className="relative flex flex-1 flex-col items-center px-4 pb-16 pt-10">
      <div className="scuff-streaks" />

      <header className="relative z-10 flex w-full max-w-[560px] items-center justify-between">
        <Link href="/" className="font-mono text-xs text-chalk/50 underline-offset-4 hover:underline">
          ← play
        </Link>
        <a
          href="/api/leaderboard/export"
          className="rounded border border-chalk/15 px-3 py-1.5 font-mono text-xs text-chalk/70 transition-colors hover:border-mustard hover:text-mustard"
        >
          export csv
        </a>
      </header>

      <div className="relative z-10 mt-6 text-center">
        <h1 className="font-display text-3xl tracking-tight text-chalk sm:text-4xl">
          THE <span className="text-mustard">LEDGER</span>
        </h1>
        <p className="mt-2 font-mono text-xs text-chalk/50">top 50, sorted by best score</p>
      </div>

      <div className="relative z-10 mt-8 w-full max-w-[560px] overflow-hidden rounded-lg border border-chalk/10 bg-asphalt-deep/60">
        {error && <p className="p-6 text-center font-mono text-xs text-signal-red">{error}</p>}

        {!error && rows === null && (
          <p className="p-8 text-center font-mono text-xs text-chalk/40">loading…</p>
        )}

        {!error && rows !== null && rows.length === 0 && (
          <p className="p-8 text-center font-mono text-xs text-chalk/40">
            no scores yet. be the first on the ledger.
          </p>
        )}

        {!error && rows !== null && rows.length > 0 && (
          <table className="w-full border-collapse font-mono text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-chalk/10 text-left text-chalk/40">
                <th className="px-4 py-3 font-normal">#</th>
                <th className="px-4 py-3 font-normal">player</th>
                <th className="hidden px-4 py-3 font-normal sm:table-cell">wallet</th>
                <th className="px-4 py-3 text-right font-normal">score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.wallet_address}
                  className="border-b border-chalk/5 last:border-none hover:bg-chalk/[0.02]"
                >
                  <td className="px-4 py-3 text-chalk/50">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-3 text-chalk">
                    @{row.x_username}
                    <span className="block text-[10px] text-chalk/30 sm:hidden">
                      {shortenAddress(row.wallet_address)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-chalk/50 sm:table-cell">
                    {shortenAddress(row.wallet_address)}
                  </td>
                  <td className="px-4 py-3 text-right text-mustard">{row.best_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
