import { NextResponse } from "next/server";
import { EDITOR_COOKIE_NAME } from "@/lib/editor/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(EDITOR_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
