// Demo mode lets the frontend run and be play-tested with no Privy app,
// no Supabase, and no network. It is on when NEXT_PUBLIC_DEMO_MODE is "true",
// or automatically when there is no Privy app id to boot real auth with.
//
// Everything here is mock data for feel-testing the UI. It is replaced by the
// real Privy session and Supabase-backed API in phase two.

export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  !process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export type LeaderboardRow = {
  x_username: string;
  wallet_address: string;
  best_score: number;
  updated_at: string;
};

export const DEMO_USER = {
  x_username: "hoodie_pilot",
  wallet_address: "0x8Ab4C1f3De90A7bE2c5D6f01234aBc5678De90F1",
};

// A believable board: varied handles, a spread of scores, recent timestamps.
export const DEMO_LEADERBOARD: LeaderboardRow[] = [
  { x_username: "rugpull_survivor", wallet_address: "0x1f2E3d4C5b6A7980112233445566778899aAbBcC", best_score: 4820, updated_at: "2026-07-18T09:12:00Z" },
  { x_username: "coin_gremlin",     wallet_address: "0xA1b2C3d4E5f60718293A4b5C6d7E8f9012345678", best_score: 4390, updated_at: "2026-07-18T08:54:00Z" },
  { x_username: "hoodie_pilot",     wallet_address: DEMO_USER.wallet_address,                     best_score: 3970, updated_at: "2026-07-18T10:31:00Z" },
  { x_username: "tarmac_tom",       wallet_address: "0xFedCba9876543210fEdCbA9876543210FeDcBa98", best_score: 3610, updated_at: "2026-07-18T07:40:00Z" },
  { x_username: "dodge_queen",      wallet_address: "0x0011223344556677889900aAbBcCdDeEfF001122", best_score: 3280, updated_at: "2026-07-18T09:58:00Z" },
  { x_username: "catch_me_l8r",     wallet_address: "0x99AaBbCcDdEeFf00112233445566778899AaBbCc", best_score: 2950, updated_at: "2026-07-18T06:15:00Z" },
  { x_username: "no_rugs_pls",      wallet_address: "0x2468ACe0135792468ace013579246810adCEf024", best_score: 2610, updated_at: "2026-07-17T22:03:00Z" },
  { x_username: "asphalt_ash",      wallet_address: "0x13579BdF02468aCe13579bDf02468Ace13579bDf", best_score: 2280, updated_at: "2026-07-17T20:47:00Z" },
  { x_username: "grip_and_go",      wallet_address: "0xCafeBabe0000111122223333444455556666Cafe", best_score: 1940, updated_at: "2026-07-17T19:22:00Z" },
  { x_username: "warm_hood",        wallet_address: "0xDeadBeef9999888877776666555544443333Dead", best_score: 1610, updated_at: "2026-07-17T18:05:00Z" },
  { x_username: "late_joiner",      wallet_address: "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01", best_score: 1200, updated_at: "2026-07-17T15:33:00Z" },
];

export const DEMO_PROFILE = {
  x_username: DEMO_USER.x_username,
  wallet_address: DEMO_USER.wallet_address,
  best_score: 3970,
  updated_at: "2026-07-18T10:31:00Z" as string | null,
};
