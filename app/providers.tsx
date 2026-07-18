"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { DemoAuthProvider } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";
import MiniAppReady from "./MiniAppReady";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Demo mode boots with no Privy app id and no network, for local feel-testing.
  if (DEMO_MODE) {
    return (
      <DemoAuthProvider>
        <MiniAppReady />
        {children}
      </DemoAuthProvider>
    );
  }

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone px-6 text-center font-mono text-sm uppercase tracking-[0.14em] text-ink/70">
        Missing NEXT_PUBLIC_PRIVY_APP_ID. Set it in your environment to boot the app.
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["twitter"],
        appearance: {
          theme: "dark",
          accentColor: "#E5401F",
          logo: undefined,
          walletChainType: "ethereum-only",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <MiniAppReady />
      {children}
    </PrivyProvider>
  );
}
