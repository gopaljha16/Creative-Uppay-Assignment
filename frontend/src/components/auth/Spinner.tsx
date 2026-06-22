import React from "react";

/** Loading spinner — used in buttons and loading states. */
const Spinner: React.FC = () => (
  <svg
    className="animate-spin"
    style={{ width: 16, height: 16, marginRight: 6 }}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8z"
    />
  </svg>
);

export default Spinner;
