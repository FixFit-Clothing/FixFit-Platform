import { type NextRequest, NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AuthFlow = "magic" | "signup" | "recovery";

function getFlow(value: string | null): AuthFlow {
  if (value === "signup" || value === "recovery") return value;
  return "magic";
}

/** Exchanges a Supabase PKCE email-flow code for cookie-backed session data. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeRedirectPath(request.nextUrl.searchParams.get("next"));
  const flow = getFlow(request.nextUrl.searchParams.get("flow"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = new URL(
        flow === "recovery" ? "/password/setup" : next,
        request.url
      );

      if (flow === "recovery") {
        destination.searchParams.set("next", next);
        destination.searchParams.set("recovery", "ready");
      } else {
        destination.searchParams.set("auth", "success");
      }

      return NextResponse.redirect(destination);
    }
  }

  const failure = new URL(
    flow === "recovery"
      ? "/forgot-password"
      : flow === "signup"
        ? "/signup"
        : "/login",
    request.url
  );
  failure.searchParams.set("error", "email-link");
  failure.searchParams.set("next", next);
  return NextResponse.redirect(failure);
}
