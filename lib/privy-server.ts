import { PrivyClient } from "@privy-io/server-auth";
import { NextRequest } from "next/server";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;

let client: PrivyClient | null = null;
function getPrivyClient() {
  if (!client) {
    client = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
  }
  return client;
}

export type AuthedPlayer = {
  privyUserId: string;
  xUsername: string;
  walletAddress: string;
};

/**
 * Verifies the Privy access token (sent as a Bearer header from the
 * client, per Privy's default local-storage session model) and pulls
 * the linked X (Twitter) username and embedded wallet address from
 * Privy's own user record — never from anything the client sent in
 * the request body. Returns null if the session is missing or invalid.
 */
export async function getAuthedPlayer(req: NextRequest): Promise<AuthedPlayer | null> {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!accessToken) return null;

  try {
    const privy = getPrivyClient();
    const verifiedClaims = await privy.verifyAuthToken(accessToken);
    const userId = verifiedClaims.userId;

    // Fetch full user record from Privy to get linked X account + embedded wallet.
    // (verifyAuthToken only proves *who* they are, not their linked accounts.)
    const user = await privy.getUser(userId);

    const xAccount = user.linkedAccounts.find(
      (a) => a.type === "twitter_oauth"
    ) as { username?: string | null } | undefined;

    const embeddedWallet = user.linkedAccounts.find(
      (a) =>
        a.type === "wallet" &&
        (a as { walletClientType?: string }).walletClientType === "privy"
    ) as { address?: string } | undefined;

    if (!xAccount?.username || !embeddedWallet?.address) {
      return null;
    }

    return {
      privyUserId: userId,
      xUsername: xAccount.username,
      walletAddress: embeddedWallet.address,
    };
  } catch {
    return null;
  }
}
