import { NextRequest, NextResponse } from "next/server";
import {
  checkEditorPassword,
  createEditorSessionToken,
  EDITOR_COOKIE_NAME,
  EDITOR_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/editor/auth";

export async function POST(req: NextRequest) {
  let password: string | undefined;
  try {
    const body = await req.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (typeof password !== "string" || !(await checkEditorPassword(password))) {
    return NextResponse.json({ error: "incorrect password" }, { status: 401 });
  }

  const token = await createEditorSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(EDITOR_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: EDITOR_COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
