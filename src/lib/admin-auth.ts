import { NextRequest, NextResponse } from "next/server";

const PIPELINE_SECRET = process.env.PIPELINE_SECRET ?? "dev-pipeline-secret";

/**
 * Check admin authorization for pipeline endpoints.
 * Accepts either:
 * - Authorization: Bearer <PIPELINE_SECRET> header
 * - ?secret=<PIPELINE_SECRET> query param (for easy testing)
 *
 * In production, set PIPELINE_SECRET env var.
 */
export function requirePipelineAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");

  const providedSecret = authHeader?.replace("Bearer ", "") ?? querySecret;

  if (providedSecret !== PIPELINE_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized. Provide valid pipeline secret." },
      { status: 401 }
    );
  }

  return null; // authorized
}
