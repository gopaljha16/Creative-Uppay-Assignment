import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import AuthPage from "./pages/AuthPage";

/* ── Shared full-screen loading spinner ── */
const FullPageLoader: React.FC = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#1c1c2e",
    }}
  >
    <svg
      style={{ width: 40, height: 40 }}
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#5555d8" strokeWidth="4" />
      <path className="opacity-75" fill="#5555d8" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  </div>
);

/* ── Protected Route wrapper ── */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1c2e",
        }}
      >
        <svg
          style={{ width: 40, height: 40, color: "#5555d8" }}
          className="animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return isSignedIn ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <Routes>
      {/* Auth — AuthPage handles session clearing + loading internally */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Home (protected) — placeholder until Home page is built */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                background: "#1c1c2e",
              }}
            >
              <p style={{ color: "#fff", fontSize: "20px", fontWeight: 600 }}>🎬 Home Page</p>
              <p style={{ color: "#888", fontSize: "14px" }}>Coming soon…</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default App;