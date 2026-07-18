"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type NavKey = "game" | "leaderboard" | "profile";

type SketchShellProps = {
  headerRight?: ReactNode;
  title: string;
  children: ReactNode;
  activeTab: NavKey;
};

// Care-label style index so each screen reads like a spec line on a garment tag.
const TAB_INDEX: Record<NavKey, string> = {
  game: "001",
  leaderboard: "002",
  profile: "003",
};

const NAV_ITEMS: { key: NavKey; href: string; label: string }[] = [
  { key: "game", href: "/", label: "Play" },
  { key: "leaderboard", href: "/leaderboard", label: "Ranks" },
  { key: "profile", href: "/profile", label: "Tag" },
];

export function SketchShell({ headerRight, title, children, activeTab }: SketchShellProps) {
  return (
    <div
      className="relative flex h-dvh justify-center overflow-hidden"
      style={{
        paddingTop: "calc(0.625rem + var(--safe-top))",
        paddingBottom: "calc(0.625rem + var(--safe-bottom))",
        paddingLeft: "calc(0.625rem + var(--safe-left))",
        paddingRight: "calc(0.625rem + var(--safe-right))",
      }}
    >
      <div className="paper-grain" />

      <div className="relative flex h-full w-full max-w-[420px] flex-col gap-2.5">
        {/* Masthead: drop wordmark as an ink block, with a care-label meta row. */}
        <header className="ink-bar shrink-0 px-3.5 pb-2 pt-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[1.75rem] uppercase leading-[0.82] tracking-[0.01em] text-bone">
              Hoodie
              <br />
              Drop
            </p>
            {headerRight && <div className="shrink-0 text-right">{headerRight}</div>}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-bone/25 pt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/55">
            <span>Limited run</span>
            <span>
              <span className="text-blaze">{TAB_INDEX[activeTab]}</span> / {title}
            </span>
          </div>
        </header>

        <main className="relative flex min-h-0 flex-1 flex-col">
          {/* Signature: cotton string + reinforced eyelet, tying the screen to the masthead.
              main stays overflow-visible so these negative-offset marks aren't clipped;
              each panel clips its own body. */}
          <div className="tag-string" aria-hidden="true" />
          <div className="tag-eyelet" aria-hidden="true" />
          {children}
        </main>

        <nav aria-label="Primary" className="ink-bar grid shrink-0 grid-cols-3 overflow-hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="drop-tab"
              data-active={activeTab === item.key}
              aria-current={activeTab === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

type SketchPanelProps = {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SketchPanel({ title, eyebrow, action, children, className = "", id }: SketchPanelProps) {
  return (
    <section id={id} className={`tag flex min-h-0 flex-col overflow-hidden ${className}`}>
      {(title || eyebrow || action) && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-ink px-3.5 py-2">
          <div className="min-w-0">
            {eyebrow && (
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.24em] text-concrete">{eyebrow}</p>
            )}
            {title && (
              <h2 className="mt-0.5 truncate font-display text-xl uppercase leading-none tracking-[0.02em] text-ink">
                {title}
              </h2>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">{children}</div>
    </section>
  );
}
