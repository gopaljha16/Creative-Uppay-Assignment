import React, { useState } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { ChevronRight, LogOut, Mail, Ticket, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import BottomNavigation from "../components/common/BottomNavigation";

const ProfilePage: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      navigate("/auth", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  const displayName = user?.fullName || user?.firstName || "Movie Lover";
  const email = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <main className="min-h-screen bg-[#f8f9fe] pb-24 text-slate-900">
      <header className="border-b border-slate-100 bg-white px-6 py-5">
        <h1 className="text-lg font-black">Profile</h1>
        <p className="mt-1 text-[11px] font-medium text-slate-400">Manage your movie account</p>
      </header>

      <section className="px-6 pt-7">
        <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white px-5 py-7 shadow-sm">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="h-20 w-20 rounded-full border-4 border-[#5e4feb]/10 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#5e4feb]/10 text-[#5e4feb]">
              <UserRound size={34} />
            </div>
          )}
          <h2 className="mt-4 text-base font-black">{displayName}</h2>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Mail size={12} />
            <span>{email}</span>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/bookings")}
            className="flex w-full items-center gap-3 px-4 py-4 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5e4feb]/10 text-[#5e4feb]">
              <Ticket size={19} />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-bold">My Bookings</span>
              <span className="mt-0.5 block text-[10px] text-slate-400">View tickets and booking history</span>
            </span>
            <ChevronRight size={17} className="text-slate-300" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white py-3 text-xs font-bold text-red-500 shadow-sm disabled:opacity-50"
        >
          <LogOut size={15} />
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </section>

      <BottomNavigation />
    </main>
  );
};

export default ProfilePage;