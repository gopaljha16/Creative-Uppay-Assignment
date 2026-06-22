import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import SchedulingPage from "./pages/SchedulingPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingsPage from "./pages/BookingsPage";

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
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/movie/:id"
        element={
          <ProtectedRoute>
            <MovieDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedule/:movieId"
        element={
          <ProtectedRoute>
            <SchedulingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seats/:showtimeId"
        element={
          <ProtectedRoute>
            <SeatSelectionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default App;