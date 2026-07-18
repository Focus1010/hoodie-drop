"use client";

// One auth surface for the whole app. In demo mode it is a self-contained
// mock (login/logout toggle a local state, no network). Otherwise it delegates
// to Privy. Pages call useAuth() and never need to know which is live.

import { createContext, useContext, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { DEMO_MODE } from "@/lib/demo";

export type Auth = {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
};

const DemoAuthContext = createContext<Auth | null>(null);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);

  const value = useMemo<Auth>(
    () => ({
      ready: true,
      authenticated,
      login: () => setAuthenticated(true),
      logout: () => setAuthenticated(false),
      getAccessToken: async () => "demo-token",
    }),
    [authenticated]
  );

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

function useDemoAuth(): Auth {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) {
    throw new Error("useAuth used in demo mode without DemoAuthProvider.");
  }
  return ctx;
}

function usePrivyAuth(): Auth {
  const { ready, authenticated, login, logout, getAccessToken } = usePrivy();
  return {
    ready,
    authenticated,
    login: () => login(),
    logout: () => {
      void logout();
    },
    getAccessToken: () => getAccessToken(),
  };
}

// Hook selection is stable for the lifetime of the app: DEMO_MODE is a
// build-time constant, so we never switch which hook runs between renders.
export const useAuth: () => Auth = DEMO_MODE ? useDemoAuth : usePrivyAuth;
