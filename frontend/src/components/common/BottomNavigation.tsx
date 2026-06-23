import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Home, Ticket, Heart, User } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: "/" },
    { icon: Ticket, path: "/bookings" },
    { icon: Heart, path: "/favorites" },
    { icon: User, path: "/profile" }
  ];

  return (
    <div 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-white border-t border-slate-100 h-[64px] flex items-center justify-around z-50 px-4"
      style={{ boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => {
              if (item.path === "/favorites") {
                alert("Favorites screen is a demo placeholder!");
              } else {
                navigate(item.path);
              }
            }}
            className="flex items-center justify-center flex-1 h-full py-2 transition-colors duration-200"
          >
            <Icon size={24} className={`stroke-[1.75] ${isActive ? "text-[#5e4feb]" : "text-slate-400"}`} />
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
