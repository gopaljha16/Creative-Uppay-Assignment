import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Home, Ticket, Heart, User } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Ticket, path: "/bookings", label: "Bookings" },
    { icon: Heart, path: "/favorites", label: "Favorites" },
    { icon: User, path: "/profile", label: "Profile" }
  ];

  return (
    <div 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-[#1c1c2e] border-t border-[#2e2d4d] h-[64px] flex items-center justify-around z-50 px-4"
      style={{ boxShadow: "0 -4px 10px rgba(0,0,0,0.3)" }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => {
              // Favorites and Profile are secondary, can redirect to home or custom alerts for demo
              if (item.path === "/favorites") {
                alert("Favorites screen is a demo placeholder!");
              } else if (item.path === "/profile") {
                navigate("/auth"); // Redirect to auth to manage session
              } else {
                navigate(item.path);
              }
            }}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200"
            style={{ color: isActive ? "#5b4fcf" : "#a1a1c1" }}
          >
            <Icon size={22} className={`stroke-[2] ${isActive ? "text-[#5b4fcf]" : "text-[#a1a1c1]"}`} />
            <span className="text-[10px] mt-1 font-medium select-none">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
