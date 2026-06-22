import React from "react";

/**
 * All shared style constants for auth screens.
 * Single source of truth — no inline style duplication across components.
 */

/* ── Page Layout ── */
export const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  background: "#1c1c2e",
};

export const loaderPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  background: "#1c1c2e",
};

/* ── Card ── */
export const cardStyle: React.CSSProperties = {
  background: "#f0f0f8",
  borderRadius: "16px",
  padding: "36px 28px 32px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
};

/* ── Title ── */
export const titleStyle: React.CSSProperties = {
  marginTop: "16px",
  textAlign: "center",
  fontWeight: 800,
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#111",
};

/* ── Tabs ── */
export const tabContainerStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  marginTop: "28px",
  background: "#dcdce8",
  borderRadius: "8px",
  padding: "3px",
};

const tabBase: React.CSSProperties = {
  flex: 1,
  padding: "9px 0",
  border: "none",
  borderRadius: "6px",
  fontFamily: "inherit",
  fontSize: "14px",
  cursor: "pointer",
  transition: "all 0.18s",
};

export const activeTabStyle: React.CSSProperties = {
  ...tabBase,
  fontWeight: 700,
  background: "#ffffff",
  color: "#111",
  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
};

export const inactiveTabStyle: React.CSSProperties = {
  ...tabBase,
  fontWeight: 500,
  background: "transparent",
  color: "#888",
  boxShadow: "none",
};

/* ── Form ── */
export const formStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  marginTop: "28px",
};

/* ── Input ── */
export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1.5px solid #c8c8d8",
  outline: "none",
  fontSize: "14px",
  color: "#333",
  padding: "8px 0",
  fontFamily: "inherit",
};

export const INPUT_FOCUS_COLOR = "#5555cc";
export const INPUT_BLUR_COLOR = "#c8c8d8";

/* ── Button ── */
export const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  background: "#5555d8",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: 700,
  letterSpacing: "0.3px",
  cursor: "pointer",
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.18s",
};

/* ── Error ── */
export const errorStyle: React.CSSProperties = {
  width: "100%",
  background: "#fff0f0",
  border: "1px solid #ffc0c0",
  color: "#c0392b",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "12px",
};

/* ── Link Button (back to signup etc.) ── */
export const linkBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#aaa",
  fontSize: "12px",
  textDecoration: "underline",
  cursor: "pointer",
  fontFamily: "inherit",
  textAlign: "center",
};
