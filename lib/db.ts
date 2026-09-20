import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    const products = await sql`SELECT * FROM products ORDER BY id DESC`;
    return NextResponse.json(products);
  } catch (error) {
    console.error("DB PRODUCTS ERROR:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}