import React from "react";
import { errorStyle } from "./auth.styles";

interface ErrorBannerProps {
  message: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <div style={errorStyle}>{message}</div>
);

export default ErrorBanner;
