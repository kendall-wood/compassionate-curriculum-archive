// Password-gate for /editor. Deliberately avoids `node:crypto`/`Buffer` so
// this same module works both in Next.js middleware (Edge runtime, which
// doesn't have those) and in the API route handlers (Node runtime) — Web
// Crypto (`crypto.subtle`) is available in both.

export const EDITOR_COOKIE_NAME = "cc_editor_session";
export const EDITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const SESSION_MESSAGE = "authenticated";

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(message: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(message)
  );
  return bufferToHex(digest);
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return bufferToHex(sig);
}

// Equal-length hex digests only — safe as a constant-time-ish compare since
// both inputs are always fixed-length SHA-256 hex strings here, never raw
// user input compared directly.
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function checkEditorPassword(password: string): Promise<boolean> {
  const expected = process.env.EDITOR_PASSWORD;
  if (!expected) return false;
  const [a, b] = await Promise.all([sha256Hex(password), sha256Hex(expected)]);
  return timingSafeEqualHex(a, b);
}

export async function createEditorSessionToken(): Promise<string> {
  const secret = process.env.EDITOR_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing EDITOR_SESSION_SECRET environment variable.");
  }
  return hmacSha256Hex(secret, SESSION_MESSAGE);
}

export async function verifyEditorSession(
  token: string | undefined | null
): Promise<boolean> {
  // TEMP: password gate disabled for client review — flip this back to
  // false to re-enable (EDITOR_PASSWORD / EDITOR_SESSION_SECRET still work
  // once it's off).
  const AUTH_DISABLED = true;
  if (AUTH_DISABLED) return true;

  if (!token) return false;
  const secret = process.env.EDITOR_SESSION_SECRET;
  if (!secret) return false;
  const expected = await hmacSha256Hex(secret, SESSION_MESSAGE);
  return timingSafeEqualHex(token, expected);
}
