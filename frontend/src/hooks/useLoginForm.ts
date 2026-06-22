import { useState, useCallback } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { extractClerkError } from "../utils/clerkError";

/**
 * Encapsulates all login form state and the submit handler.
 *
 * @param ensureSignedOut — from useAuthSession, clears stale sessions before auth
 */
export function useLoginForm(ensureSignedOut: () => Promise<void>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, setActive, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded) return;

      setError("");
      if (!email.trim()) return setError("Please enter your email.");
      if (!password) return setError("Please enter your password.");

      setLoading(true);
      try {
        await ensureSignedOut();

        const result = await signIn.create({
          identifier: email.trim(),
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          navigate("/");
        } else {
          setError("Login incomplete. Please try again.");
        }
      } catch (err) {
        setError(extractClerkError(err, "Invalid credentials. Please try again."));
      } finally {
        setLoading(false);
      }
    },
    [email, password, isLoaded, signIn, setActive, navigate, ensureSignedOut]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleLogin,
  };
}
