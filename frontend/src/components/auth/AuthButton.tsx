import React from "react";
import { btnStyle } from "./auth.styles";
import Spinner from "./Spinner";

interface AuthButtonProps {
  id: string;
  label: string;
  loadingLabel: string;
  loading: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  id,
  label,
  loadingLabel,
  loading,
  type = "submit",
  onClick,
}) => (
  <button
    id={id}
    type={type}
    disabled={loading}
    onClick={onClick}
    style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
  >
    {loading && <Spinner />}
    {loading ? loadingLabel : label}
  </button>
);

export default AuthButton;
