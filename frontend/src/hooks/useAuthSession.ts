import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";

export function useAuthSession() {
  const { isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();
  const [ready, setReady] = useState(false);

  const clearedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || clearedRef.current) return;

    const clearAndReady = async () => {
      if (isSignedIn) {
        await clerk.signOut();
      }

      clearedRef.current = true;
      setReady(true);
    };

    clearAndReady();
  }, [isLoaded, isSignedIn, clerk]);

  const ensureSignedOut = useCallback(async () => {
    try {
      await clerk.signOut();
    } catch {
      // Signing out is best-effort; Clerk may already have cleared the session.
    }
    await new Promise((r) => setTimeout(r, 150));
  }, [clerk]);

  return { ready, ensureSignedOut };
}
