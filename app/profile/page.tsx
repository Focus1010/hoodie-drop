"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { DEMO_MODE, DEMO_PROFILE } from "@/lib/demo";
import { SketchPanel, SketchShell } from "@/components/SketchShell";

type ProfileData = {
  x_username: string;
  wallet_address: string;
  best_score: number;
  updated_at: string | null;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ProfilePage() {
  const { getAccessToken, ready, authenticated, login } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!ready || !authenticated) return;

      if (DEMO_MODE) {
        setProfile(DEMO_PROFILE);
        return;
      }

      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data.error ?? "Failed to load profile.");
          return;
        }
        setProfile(data.profile);
      } catch {
        if (alive) setError("Failed to load profile.");
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [authenticated, getAccessToken, ready]);

  return (
    <SketchShell
      activeTab="profile"
      title="Tag"
      headerRight={
        ready && !authenticated ? (
          <button
            onClick={login}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/70 underline-offset-4 hover:text-bone hover:underline"
          >
            log in
          </button>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45">owner</span>
        )
      }
    >
      <SketchPanel eyebrow="Owner tag" title="Your fit" className="flex-1 min-h-0">
        {!ready && <p className="font-mono text-xs uppercase tracking-[0.18em] text-concrete">loading</p>}

        {ready && !authenticated && (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-6 text-center">
            <p className="max-w-[24ch] font-body text-sm leading-relaxed text-ink-soft">
              Sign in with X to claim your owner tag and track your best drop.
            </p>
            <button
              onClick={login}
              className="min-h-12 border-[3px] border-ink bg-blaze px-7 py-3 font-display text-base uppercase tracking-[0.08em] text-bone transition-transform active:translate-y-[1px]"
            >
              Log in with X
            </button>
          </div>
        )}

        {ready && authenticated && (
          <div className="grid gap-2.5">
            {error && <p className="font-mono text-xs uppercase tracking-[0.14em] text-blaze">{error}</p>}
            {!error && !profile && (
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-concrete">loading</p>
            )}
            {!error && profile && (
              <>
                {/* Handle sits as the brand line on the tag. */}
                <div className="border-[3px] border-ink bg-ink px-4 py-3 text-bone">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-bone/55">X handle</p>
                  <p className="mt-1.5 font-display text-2xl uppercase leading-none tracking-[0.01em]">
                    @{profile.x_username}
                  </p>
                </div>

                {/* Score printed loud, like a size stamp. */}
                <div className="flex items-end justify-between border-[3px] border-ink bg-blaze px-4 py-3 text-bone">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-bone/70">Best score</p>
                  <p className="font-display text-4xl leading-[0.8]">{profile.best_score}</p>
                </div>

                <div className="border-[3px] border-ink px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-concrete">Wallet</p>
                  <p className="mt-1.5 font-mono text-sm text-ink">{shortenAddress(profile.wallet_address)}</p>
                </div>
              </>
            )}
          </div>
        )}
      </SketchPanel>
    </SketchShell>
  );
}
