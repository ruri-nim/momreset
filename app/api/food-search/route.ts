import { NextResponse } from "next/server";
import { searchMfdsFoods } from "@/lib/mfds-food-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const results = await searchMfdsFoods(query);

  return NextResponse.json({ results, source: "mfds" });
}
