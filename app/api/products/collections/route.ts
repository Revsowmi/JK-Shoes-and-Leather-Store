import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const collections = await sql`SELECT * FROM collections ORDER BY sort_order ASC`;
    return NextResponse.json(collections);
  } catch (error) {
    console.error("DB COLLECTIONS ERROR:", error);
    return NextResponse.json({ error: "Failed to load collections" }, { status: 500 });
  }
}