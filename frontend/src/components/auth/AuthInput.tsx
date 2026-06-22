import React from "react";
import { inputStyle, INPUT_FOCUS_COLOR, INPUT_BLUR_COLOR } from "./auth.styles";

interface AuthInputProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

/** Underline-only input matching the Figma design. */
const AuthInput: React.FC<AuthInputProps> = ({
  id,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    autoComplete={autoComplete}
    style={inputStyle}
    onFocus={(e) => (e.target.style.borderBottomColor = INPUT_FOCUS_COLOR)}
    onBlur={(e) => (e.target.style.borderBottomColor = INPUT_BLUR_COLOR)}
  />
);

export default AuthInput;
