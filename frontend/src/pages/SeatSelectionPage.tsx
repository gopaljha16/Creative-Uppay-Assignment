import React from "react";
import { useParams, useNavigate } from "react-router";

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1c1c2e] text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-sm font-bold">Seat Selection Page</h1>
      <p className="text-[10px] text-[#a1a1c1] mt-1">Showtime ID: {showtimeId}</p>
      <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-[#5b4fcf] text-xs rounded-xl font-bold">
        Back to Home
      </button>
    </div>
  );
};

export default SeatSelectionPage;
