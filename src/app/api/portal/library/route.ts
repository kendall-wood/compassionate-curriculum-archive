import { NextResponse } from "next/server";
import { scanLibrary } from "@/lib/portal/library";

export async function GET() {
  const images = scanLibrary();
  return NextResponse.json({ images });
}
