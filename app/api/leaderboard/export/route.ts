import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("players")
    .select("x_username, wallet_address, best_score")
    .order("best_score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  const header = ["x_username", "wallet_address", "score"];
  const rows = (data ?? []).map((p) =>
    [csvEscape(p.x_username), csvEscape(p.wallet_address), csvEscape(p.best_score)].join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hoodie-drop-leaderboard.csv"`,
    },
  });
}
