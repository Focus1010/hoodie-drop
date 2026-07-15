"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import Game from "@/components/Game";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function HomePage() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const embeddedWallet = user?.linkedAccounts.find(
    (a) => a.type === "wallet" && (a as { walletClientType?: string }).walletClientType === "privy"
  ) as { address?: string } | undefined;

  const xAccount = user?.linkedAccounts.find((a) => a.type === "twitter_oauth") as
    | { username?: string | null }
    | undefined;

  return (
    <div className="relative flex flex-1 flex-col items-center px-4 pb-16 pt-10">
      <div className="scuff-streaks" />

      <header className="relative z-10 flex w-full max-w-[400px] items-center justify-between">
        <Link href="/leaderboard" className="font-mono text-xs text-chalk/50 underline-offset-4 hover:underline">
          ledger →
        </Link>
        {ready && authenticated && (
          <button
            onClick={logout}
            className="font-mono text-xs text-chalk/50 underline-offset-4 hover:underline"
          >
            log out
          </button>
        )}
      </header>

      <div className="relative z-10 mt-6 flex flex-col items-center text-center">
        <h1 className="font-display text-4xl leading-none tracking-tight text-chalk sm:text-5xl">
          HOODIE
          <span className="text-mustard"> DROP</span>
        </h1>
        <p className="mt-3 max-w-[30ch] font-mono text-xs text-chalk/60">
          catch the coins. dodge the rug bags. get on the ledger.
        </p>
      </div>

      <div className="relative z-10 mt-8 w-full max-w-[400px]">
        {!ready && (
          <div className="flex justify-center py-16">
            <p className="font-mono text-xs text-chalk/40">loading…</p>
          </div>
        )}

        {ready && !authenticated && (
          <div className="flex flex-col items-center gap-5 rounded-lg border border-chalk/10 bg-asphalt-deep/60 px-6 py-12">
            <p className="max-w-[28ch] text-center font-mono text-xs leading-relaxed text-chalk/60">
              log in with X to get a wallet and start playing. no seed phrase, no extension.
            </p>
            <button
              onClick={login}
              className="rounded bg-chalk px-6 py-3 font-display text-sm tracking-wide text-asphalt-deep transition-transform active:scale-95"
            >
              LOG IN WITH X
            </button>
          </div>
        )}

        {ready && authenticated && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 rounded-full border border-chalk/10 bg-asphalt-deep/60 px-4 py-2 font-mono text-xs text-chalk/70">
              {xAccount?.username && <span className="text-mustard">@{xAccount.username}</span>}
              {embeddedWallet?.address && (
                <>
                  <span className="text-chalk/20">·</span>
                  <span>{shortenAddress(embeddedWallet.address)}</span>
                </>
              )}
            </div>

            <Game />
          </div>
        )}
      </div>
    </div>
  );
}
