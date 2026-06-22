import React, { useState } from "react";

/* ── Hooks ── */
import { useAuthSession } from "../hooks/useAuthSession";
import { useLoginForm } from "../hooks/useLoginForm";
import { useSignupForm } from "../hooks/useSignupForm";

/* ── Components ── */
import SofaIcon from "../components/auth/SofaIcon";
import AuthTabs from "../components/auth/AuthTabs";
import LoginForm from "../components/auth/LoginForm";
import { SignupForm, VerifyForm } from "../components/auth/SignupForm";
import Spinner from "../components/auth/Spinner";

/* ── Styles ── */
import { pageStyle, loaderPageStyle, cardStyle, titleStyle } from "../components/auth/auth.styles";

/**
 * Auth page — thin orchestrator that composes reusable hooks + components.
 * All Clerk logic lives in hooks; all UI lives in components.
 */
const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  /* Session management — clears stale sessions before form renders */
  const { ready, ensureSignedOut } = useAuthSession();

  /* Form hooks — all auth logic encapsulated */
  const login = useLoginForm(ensureSignedOut);
  const signup = useSignupForm(ensureSignedOut);

  /* Reset errors when switching tabs */
  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    login.setError("");
    signup.setError("");
  };

  /* ── Loading state while clearing stale sessions ── */
  if (!ready) {
    return (
      <div style={loaderPageStyle}>
        <Spinner />
        <p style={{ color: "#888", fontSize: "13px" }}>Preparing…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <SofaIcon />

        <h1 style={titleStyle}>
          Creative Upaay<br />Hiring Assignment
        </h1>

        <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* ── Login ── */}
        {activeTab === "login" && (
          <LoginForm
            email={login.email}
            password={login.password}
            error={login.error}
            loading={login.loading}
            onEmailChange={login.setEmail}
            onPasswordChange={login.setPassword}
            onSubmit={login.handleLogin}
          />
        )}

        {/* ── Sign Up ── */}
        {activeTab === "signup" && !signup.pendingVerification && (
          <SignupForm
            name={signup.name}
            email={signup.email}
            password={signup.password}
            confirmPassword={signup.confirmPassword}
            error={signup.error}
            loading={signup.loading}
            onNameChange={signup.setName}
            onEmailChange={signup.setEmail}
            onPasswordChange={signup.setPassword}
            onConfirmChange={signup.setConfirmPassword}
            onSubmit={signup.handleSignUp}
          />
        )}

        {/* ── Email Verification ── */}
        {activeTab === "signup" && signup.pendingVerification && (
          <VerifyForm
            email={signup.email}
            code={signup.code}
            error={signup.codeError}
            onCodeChange={signup.setCode}
            onSubmit={signup.handleVerify}
            onBack={signup.goBackToSignup}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
