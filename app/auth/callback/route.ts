import { type NextRequest, NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Exchanges a Supabase PKCE magic-link code for cookie-backed session data. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeRedirectPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = new URL(next, request.url);
      destination.searchParams.set("auth", "success");
      return NextResponse.redirect(destination);
    }
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("error", "magic-link");
  login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
