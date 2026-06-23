import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../config";
import type { RootState } from "../store/store";
import { toggleSeat } from "../store/bookingSlice";
import BottomNavigation from "../components/common/BottomNavigation";

interface Seat {
  row: string;
  col: number;
  status: "available" | "occupied" | "locked";
  userId: string | null;
}

interface Showtime {
  _id: string;
  movieId: string;
  theatreName: string;
  date: string;
  time: string;
  format: string;
  price: number;
  seats: Seat[];
}

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [locking, setLocking] = useState<boolean>(false);

  const selectedSeats = useSelector((state: RootState) => state.booking.selectedSeats);
  const movie = useSelector((state: RootState) => state.booking.selectedMovie);

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/showtimes/${showtimeId}`);
      const result = await res.json();
      if (result.success) {
        setShowtime(result.data);
      } else {
        setError(result.message || "Failed to load seat layout.");
      }
    } catch (err) {
      console.error("Fetch showtime error:", err);
      setError("Error connecting to seat server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showtimeId) {
      fetchShowtime();
    }
  }, [showtimeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] text-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5e4feb]"></div>
      </div>
    );
  }

  if (error || !showtime) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] text-slate-900 p-4 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-500 text-xs font-semibold">{error || "Showtime not found."}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[#5e4feb] text-xs font-bold rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

  const handleSeatClick = (seatCode: string, seatStatus: string) => {
    if (seatStatus === "occupied") return;

    const isAlreadySelected = selectedSeats.includes(seatCode);
    if (!isAlreadySelected && selectedSeats.length >= 6) {
      alert("You can select a maximum of 6 seats per booking.");
      return;
    }

    dispatch(toggleSeat(seatCode));
  };

  const handleProceedToSummary = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    if (!user || !user.id) {
      alert("Authentication error. Please login.");
      return;
    }

    try {
      setLocking(true);
      const res = await fetch(`${API_URL}/api/showtimes/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId,
          seats: selectedSeats,
          userId: user.id
        })
      });

      const result = await res.json();

      if (result.success) {
        navigate("/checkout");
      } else {
        alert(result.message || "Failed to reserve seats. Please select other seats.");
        fetchShowtime();
      }
    } catch (err) {
      console.error("Lock seats error:", err);
      alert("Network error while securing seat locks. Please try again.");
    } finally {
      setLocking(false);
    }
  };

  const currentTotalPrice = selectedSeats.length * showtime.price;

  const renderRow = (rowLabel: string, colCount: number) => {
    const seatsInRow = [];
    for (let c = 1; c <= colCount; c++) {
      const seatCode = `${rowLabel}${c}`;
      const dbSeat = showtime.seats.find((s) => s.row === rowLabel && s.col === c);
      
      const isOccupied = dbSeat?.status === "occupied" || 
                         (dbSeat?.status === "locked" && dbSeat?.userId !== user?.id);
      const isSelected = selectedSeats.includes(seatCode);

      let seatClass = "bg-white border border-slate-200 text-slate-500 hover:border-[#5e4feb] hover:text-[#5e4feb]";
      if (isOccupied) {
        seatClass = "bg-slate-200 border-transparent text-slate-400 cursor-not-allowed";
      } else if (isSelected) {
        seatClass = "bg-[#5e4feb] border-transparent text-white shadow-sm";
      }

      seatsInRow.push(
        <button
          key={seatCode}
          disabled={isOccupied}
          onClick={() => handleSeatClick(seatCode, isOccupied ? "occupied" : "available")}
          className={`w-6 h-6 rounded-md text-[8px] font-bold flex items-center justify-center transition-all ${seatClass}`}
        >
          {c}
        </button>
      );
    }

    return (
      <div key={rowLabel} className="flex items-center gap-1">
        <span className="w-4 text-[9px] font-black text-slate-400 text-left">{rowLabel}</span>
        <div className="flex gap-1.5 justify-center flex-1">
          {seatsInRow}
        </div>
        <span className="w-4 text-[9px] font-black text-slate-400 text-right">{rowLabel}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fe] text-slate-900 pb-[140px] relative">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <button
          onClick={() => navigate(`/schedule/${movie?._id}`)}
          className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 font-bold"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold block">Total Price</span>
          <span className="text-sm font-black text-[#5e4feb]">₹{currentTotalPrice}</span>
        </div>
      </div>

      <div className="px-4 py-3 bg-white">
        <h1 className="text-sm font-black text-slate-900">Select Seats</h1>
        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
          Screen 1 • {showtime.time}
        </p>
      </div>

      <div className="w-full flex flex-col items-center mt-6 mb-6">
        <svg className="w-[80%] h-3 text-slate-200" viewBox="0 0 100 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 9C30 3 70 3 95 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black mt-1">Screen</span>
      </div>

      <div className="px-4 flex flex-col gap-2 mt-4 select-none">
        <div className="flex flex-col gap-2">
          {seatRows.map((row) => renderRow(row, 12))}
        </div>
      </div>

      <div className="px-4 mt-8 flex justify-center gap-6 text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-slate-200 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-200" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#5e4feb]" />
          <span>Selected</span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="px-4 mt-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold">
            Selected Seats: <span className="text-[#5e4feb] font-black">{selectedSeats.join(", ")}</span>
          </p>
        </div>
      )}

      <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-100 z-40">
        <button
          onClick={handleProceedToSummary}
          disabled={selectedSeats.length === 0 || locking}
          className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            selectedSeats.length > 0 && !locking
              ? "bg-[#5e4feb] hover:bg-[#4f46e5] text-white shadow-md"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
          }`}
        >
          {locking ? "Securing seats..." : "View Booking Summary"}
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SeatSelectionPage;
