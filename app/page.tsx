"use client";

import { useAuth } from "@/lib/auth";
import Game from "@/components/Game";
import { SketchPanel, SketchShell } from "@/components/SketchShell";

export default function HomePage() {
  const { ready, authenticated, login, logout } = useAuth();

  return (
    <SketchShell
      activeTab="game"
      title="Play"
      headerRight={
        ready && authenticated ? (
          <button
            onClick={logout}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/70 underline-offset-4 hover:text-bone hover:underline"
          >
            log out
          </button>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45">not in</span>
        )
      }
    >
      {!ready && (
        <SketchPanel eyebrow="status" title="Warming up" className="flex-1 min-h-0">
          <div className="flex h-full min-h-[220px] items-center justify-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-concrete">loading</p>
          </div>
        </SketchPanel>
      )}

      {ready && !authenticated && (
        <SketchPanel eyebrow="Members only" title="Cop the drop" className="flex-1 min-h-0">
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-6 text-center">
            <p className="max-w-[24ch] font-body text-sm leading-relaxed text-ink-soft">
              Sign in with X to lock in your best score and take a spot on the ranks.
            </p>
            <button
              onClick={login}
              className="min-h-12 border-[3px] border-ink bg-blaze px-7 py-3 font-display text-base uppercase tracking-[0.08em] text-bone transition-transform active:translate-y-[1px]"
            >
              Log in with X
            </button>
          </div>
        </SketchPanel>
      )}

      {ready && authenticated && (
        <SketchPanel eyebrow="Fit check" title="The drop" className="flex-1 min-h-0">
          <div className="h-full">
            <Game />
          </div>
        </SketchPanel>
      )}
    </SketchShell>
  );
}
