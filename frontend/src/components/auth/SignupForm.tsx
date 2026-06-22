import React from "react";
import { formStyle, linkBtnStyle } from "./auth.styles";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";
import ErrorBanner from "./ErrorBanner";

/* ── Sign Up Form Props ── */
interface SignupFormProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onConfirmChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Sign-up form — purely presentational. */
export const SignupForm: React.FC<SignupFormProps> = ({
  name,
  email,
  password,
  confirmPassword,
  error,
  loading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
}) => (
  <form id="signup-form" onSubmit={onSubmit} noValidate style={formStyle}>
    <AuthInput
      id="signup-name"
      type="text"
      placeholder="Name"
      value={name}
      onChange={(e) => onNameChange(e.target.value)}
      autoComplete="name"
    />
    <AuthInput
      id="signup-email"
      type="email"
      placeholder="Email ID"
      value={email}
      onChange={(e) => onEmailChange(e.target.value)}
      autoComplete="email"
    />
    <AuthInput
      id="signup-password"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => onPasswordChange(e.target.value)}
      autoComplete="new-password"
    />
    <AuthInput
      id="signup-confirm-password"
      type="password"
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e) => onConfirmChange(e.target.value)}
      autoComplete="new-password"
    />

    {error && <ErrorBanner message={error} />}

    <AuthButton
      id="signup-submit"
      label="Sign Up"
      loadingLabel="Creating account…"
      loading={loading}
    />
  </form>
);

/* ── Verify Form Props ── */
interface VerifyFormProps {
  email: string;
  code: string;
  error: string;
  onCodeChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

/** Email verification step — shown after signup. */
export const VerifyForm: React.FC<VerifyFormProps> = ({
  email,
  code,
  error,
  onCodeChange,
  onSubmit,
  onBack,
}) => (
  <form
    id="verify-form"
    onSubmit={onSubmit}
    noValidate
    style={{ ...formStyle, gap: "20px" }}
  >
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#333" }}>
        Check your inbox!
      </p>
      <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
        We sent a code to&nbsp;
        <strong style={{ color: "#5555d8" }}>{email}</strong>
      </p>
    </div>

    <AuthInput
      id="verify-code"
      type="text"
      placeholder="Enter 6-digit verification code"
      value={code}
      onChange={(e) => onCodeChange(e.target.value)}
      autoComplete="one-time-code"
    />

    {error && <ErrorBanner message={error} />}

    <AuthButton
      id="verify-submit"
      label="Verify Email"
      loadingLabel="Verifying…"
      loading={false}
    />

    <button type="button" onClick={onBack} style={linkBtnStyle}>
      ← Back to sign up
    </button>
  </form>
);
