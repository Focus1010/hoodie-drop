"use client";

// Tells the Farcaster host the mini app has finished loading and is ready to
// display. Without this call the host shows an infinite splash screen.
// Docs: https://miniapps.farcaster.xyz/docs/getting-started
//
// Safe outside Farcaster too: if there is no host, ready() rejects and we
// swallow it, so the app runs normally in a plain browser.

import { useEffect } from "react";

export default function MiniAppReady() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        if (cancelled) return;
        await sdk.actions.ready();
      } catch {
        // Not running inside a Farcaster host, or SDK unavailable. Ignore.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
