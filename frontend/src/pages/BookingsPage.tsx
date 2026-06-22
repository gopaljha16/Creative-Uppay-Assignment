import React from "react";
import { useNavigate } from "react-router";
import BottomNavigation from "../components/common/BottomNavigation";

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1c1c2e] text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-sm font-bold">My Bookings</h1>
      <p className="text-[10px] text-[#a1a1c1] mt-1">Booking history and digital tickets.</p>
      <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-[#5b4fcf] text-xs rounded-xl font-bold">
        Back to Home
      </button>
      <BottomNavigation />
    </div>
  );
};

export default BookingsPage;
