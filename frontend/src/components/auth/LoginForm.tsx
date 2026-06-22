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

/** Login form — purely presentational, all logic lives in useLoginForm hook. */
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

    {error && <ErrorBanner message={error} />}

    {/* Spacer to push button down like Figma */}
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
