const fallbackPath = "/account";

/** Restricts post-auth redirects to local, single-slash application paths. */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = fallbackPath
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  // Backslashes can be interpreted as URL separators by some clients.
  if (value.includes("\\")) {
    return fallback;
  }

  const candidate = new URL(value, "http://fixfit.local");

  if (candidate.origin !== "http://fixfit.local") {
    return fallback;
  }

  return `${candidate.pathname}${candidate.search}${candidate.hash}`;
}
