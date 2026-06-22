import { useEffect, useState, useCallback } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";

/**
 * Handles clearing stale Clerk sessions when the auth page mounts.
 *
 * Returns:
 *  - `ready`: true once any existing session has been cleared
 *  - `ensureSignedOut`: call before any signIn/signUp to guarantee a clean slate
 */
export function useAuthSession() {
  const { isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();
  const [ready, setReady] = useState(false);

  /* Clear stale sessions BEFORE showing the auth form */
  useEffect(() => {
    const clearAndReady = async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        await clerk.signOut();
      }

      setReady(true);
    };

    clearAndReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  /* Callable helper — always signs out + waits for Clerk state to settle */
  const ensureSignedOut = useCallback(async () => {
    try {
      await clerk.signOut();
    } catch {
      // Might already be signed out — ignore
    }
    await new Promise((r) => setTimeout(r, 150));
  }, [clerk]);

  return { ready, ensureSignedOut };
}
