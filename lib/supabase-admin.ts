import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which bypasses RLS.
// NEVER import this file from a "use client" component.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type Player = {
  id: string;
  privy_user_id: string;
  x_username: string;
  wallet_address: string;
  best_score: number;
  updated_at: string;
};
