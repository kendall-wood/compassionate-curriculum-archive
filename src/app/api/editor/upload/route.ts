// Handles direct-to-Blob image uploads for the editor. This route is listed
// as a public path in middleware.ts because Vercel's blob service calls it
// twice for two different reasons: once from the logged-in browser to mint
// an upload token (which IS gated — see the cookie check below), and once
// later, server-to-server from Vercel itself with no cookie at all, to
// confirm the upload completed. The @vercel/blob signature check inside
// handleUpload is what authenticates that second call instead.
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EDITOR_COOKIE_NAME, verifyEditorSession } from "@/lib/editor/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const token = cookies().get(EDITOR_COOKIE_NAME)?.value;
        if (!(await verifyEditorSession(token))) {
          throw new Error("Not logged in to the editor.");
        }
        return {
          allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
