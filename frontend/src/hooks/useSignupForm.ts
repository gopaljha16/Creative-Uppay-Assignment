import { useState, useCallback } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { extractClerkError } from "../utils/clerkError";

export function useSignupForm(ensureSignedOut: () => Promise<void>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const { signUp, setActive, isLoaded } = useSignUp();
  const navigate = useNavigate();

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded) return;

      setError("");
      if (!name.trim()) return setError("Please enter your name.");
      if (!email.trim()) return setError("Please enter your email.");
      if (password.length < 8)
        return setError("Password must be at least 8 characters.");
      if (password !== confirmPassword)
        return setError("Passwords do not match.");

      setLoading(true);
      try {
        await ensureSignedOut();

        await signUp.create({
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" ") || "",
          emailAddress: email.trim(),
          password,
        });

        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
      } catch (err) {
        setError(extractClerkError(err, "Sign up failed. Please try again."));
      } finally {
        setLoading(false);
      }
    },
    [name, email, password, confirmPassword, isLoaded, signUp, ensureSignedOut]
  );

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded) return;

      setCodeError("");
      try {
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          navigate("/");
        } else {
          setCodeError("Verification failed. Please try again.");
        }
      } catch (err) {
        setCodeError(extractClerkError(err, "Invalid code."));
      }
    },
    [code, isLoaded, signUp, setActive, navigate]
  );

  const goBackToSignup = useCallback(() => {
    setPendingVerification(false);
  }, []);

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    loading,
    pendingVerification,
    code,
    setCode,
    codeError,
    handleSignUp,
    handleVerify,
    goBackToSignup,
  };
}
