import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    const collections = await sql`SELECT * FROM collections ORDER BY sort_order ASC`;
    return NextResponse.json(collections);
  } catch (error) {
    console.error("DB COLLECTIONS ERROR:", error);
    return NextResponse.json({ error: "Failed to load collections" }, { status: 500 });
  }
}