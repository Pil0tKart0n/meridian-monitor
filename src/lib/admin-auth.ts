import { NextRequest, NextResponse } from "next/server";

/**
 * Check admin authorization for pipeline endpoints.
 * Accepts: Authorization: Bearer <PIPELINE_SECRET> header
 *
 * PIPELINE_SECRET must be set as env var — no default fallback.
 */
export function requirePipelineAuth(request: NextRequest): NextResponse | null {
  const secret = process.env.PIPELINE_SECRET;

  if (!secret) {
    console.error("[Auth] PIPELINE_SECRET not configured");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!providedSecret || providedSecret !== secret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null; // authorized
}
