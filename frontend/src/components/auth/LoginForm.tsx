import React from "react";
import { formStyle } from "./auth.styles";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";
import ErrorBanner from "./ErrorBanner";

interface LoginFormProps {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => (
  <form id="login-form" onSubmit={onSubmit} noValidate style={formStyle}>
    <AuthInput
      id="login-email"
      type="email"
      placeholder="Email ID"
      value={email}
      onChange={(e) => onEmailChange(e.target.value)}
      autoComplete="email"
    />
    <AuthInput
      id="login-password"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => onPasswordChange(e.target.value)}
      autoComplete="current-password"
    />
    {demoEmail && demoPassword && (
      <button
        type="button"
        onClick={() => {
          onEmailChange(demoEmail);
          onPasswordChange(demoPassword);
        }}
        style={{
          border: "1px solid rgba(124, 92, 255, 0.35)",
          borderRadius: 10,
          padding: "9px 12px",
          background: "rgba(124, 92, 255, 0.08)",
          color: "#b8a9ff",
          fontSize: 11,
          cursor: "pointer",
        }}
      >
        Use demo account: {demoEmail}
      </button>
    )}
    {error && <ErrorBanner message={error} />}
    <div style={{ flex: 1 }} />
    <AuthButton
      id="login-submit"
      label="Login"
      loadingLabel="Logging in…"
      loading={loading}
    />
  </form>
);

export default LoginForm;
