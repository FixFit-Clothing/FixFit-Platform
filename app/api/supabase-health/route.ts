import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" };

/**
 * Checks Supabase Auth endpoint connectivity only. It does not verify database
 * permissions, schema readiness, or an authenticated user session.
 */
export async function GET() {
  const config = getSupabaseEnv();

  if (!config) {
    return NextResponse.json(
      {
        endpointReachable: false,
        requestSucceeded: false,
        configured: false,
        scope:
          "Supabase Auth endpoint connectivity only; database permissions and schema are not checked.",
      },
      { status: 503, headers: noStoreHeaders }
    );
  }

  try {
    const endpoint = new URL(
      "/auth/v1/health",
      config.NEXT_PUBLIC_SUPABASE_URL
    );
    const response = await fetch(endpoint, {
      headers: {
        apikey: config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
      cache: "no-store",
    });

    return NextResponse.json(
      {
        endpointReachable: true,
        requestSucceeded: response.ok,
        configured: true,
        scope:
          "Supabase Auth endpoint connectivity only; database permissions and schema are not checked.",
      },
      { status: response.ok ? 200 : 502, headers: noStoreHeaders }
    );
  } catch {
    return NextResponse.json(
      {
        endpointReachable: false,
        requestSucceeded: false,
        configured: true,
        scope:
          "Supabase Auth endpoint connectivity only; database permissions and schema are not checked.",
      },
      { status: 502, headers: noStoreHeaders }
    );
  }
}
