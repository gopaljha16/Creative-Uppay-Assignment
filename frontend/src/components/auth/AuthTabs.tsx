import React from "react";
import { tabContainerStyle, activeTabStyle, inactiveTabStyle } from "./auth.styles";

type AuthTab = "login" | "signup";

interface AuthTabsProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => (
  <div style={tabContainerStyle}>
    {(["login", "signup"] as const).map((tab) => (
      <button
        key={tab}
        id={`tab-${tab}`}
        onClick={() => onTabChange(tab)}
        style={activeTab === tab ? activeTabStyle : inactiveTabStyle}
      >
        {tab === "login" ? "Login" : "Sign Up"}
      </button>
    ))}
  </div>
);

export default AuthTabs;
