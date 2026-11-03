"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

type SignOutButtonProps = {
  className?: string;
  onSignedOut?: () => void;
};

export function SignOutButton({ className, onSignedOut }: SignOutButtonProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setIsSigningOut(false);

    if (error) {
      toast.error("We could not sign you out right now. Please try again.");
      return;
    }

    onSignedOut?.();
    toast.success("You have been signed out.");
    router.push("/");
    router.refresh();
  }

  return (
    <button
      className={className}
      disabled={isSigningOut}
      onClick={() => void handleSignOut()}
      type="button"
    >
      {isSigningOut ? "Signing out…" : "Logout"}
    </button>
  );
}
