import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Calendar, Clock, MapPin, XCircle } from "lucide-react";
import { API_URL } from "../config";
import BottomNavigation from "../components/common/BottomNavigation";

interface Movie {
  _id: string;
  title: string;
  bannerUrl: string;
  posterUrl: string;
  description: string;
  genre: string;
  duration: string;
  rating: string;
  releaseDate: string;
}

interface Showtime {
  _id: string;
  movieId: Movie;
  theatreName: string;
  date: string;
  time: string;
  format: string;
  price: number;
}

interface Booking {
  _id: string;
  userId: string;
  showtimeId: Showtime;
  seats: string[];
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  transactionId: string;
  bookingDate: string;
  createdAt: string;
}

const QRCode: React.FC = () => {
  return (
    <svg width="64" height="64" viewBox="0 0 100 100" className="bg-white p-1 rounded-lg text-black border border-slate-100">
      <rect x="5" y="5" width="25" height="25" fill="currentColor" />
      <rect x="10" y="10" width="15" height="15" fill="white" />
      <rect x="13" y="13" width="9" height="9" fill="currentColor" />
      <rect x="70" y="5" width="25" height="25" fill="currentColor" />
      <rect x="75" y="10" width="15" height="15" fill="white" />
      <rect x="78" y="13" width="9" height="9" fill="currentColor" />
      <rect x="5" y="70" width="25" height="25" fill="currentColor" />
      <rect x="10" y="75" width="15" height="15" fill="white" />
      <rect x="13" y="78" width="9" height="9" fill="currentColor" />
      <rect x="70" y="70" width="10" height="10" fill="currentColor" />
      <rect x="73" y="73" width="4" height="4" fill="white" />
      <rect x="75" y="75" width="2" height="2" fill="currentColor" />
      <rect x="35" y="5" width="5" height="5" fill="currentColor" /><rect x="45" y="5" width="10" height="5" fill="currentColor" /><rect x="60" y="5" width="5" height="5" fill="currentColor" />
      <rect x="35" y="15" width="15" height="5" fill="currentColor" /><rect x="55" y="15" width="5" height="5" fill="currentColor" />
      <rect x="40" y="25" width="5" height="5" fill="currentColor" /><rect x="50" y="25" width="15" height="5" fill="currentColor" />
      <rect x="5" y="35" width="5" height="15" fill="currentColor" /><rect x="20" y="35" width="10" height="5" fill="currentColor" /><rect x="35" y="35" width="5" height="5" fill="currentColor" /><rect x="45" y="35" width="15" height="5" fill="currentColor" /><rect x="70" y="35" width="5" height="5" fill="currentColor" /><rect x="80" y="35" width="15" height="5" fill="currentColor" />
      <rect x="10" y="45" width="5" height="5" fill="currentColor" /><rect x="25" y="45" width="5" height="5" fill="currentColor" /><rect x="40" y="45" width="10" height="5" fill="currentColor" /><rect x="60" y="45" width="5" height="5" fill="currentColor" /><rect x="75" y="45" width="10" height="5" fill="currentColor" />
      <rect x="5" y="55" width="15" height="5" fill="currentColor" /><rect x="30" y="55" width="5" height="5" fill="currentColor" /><rect x="50" y="55" width="15" height="5" fill="currentColor" /><rect x="70" y="55" width="5" height="5" fill="currentColor" /><rect x="85" y="55" width="10" height="5" fill="currentColor" />
      <rect x="35" y="70" width="10" height="5" fill="currentColor" /><rect x="55" y="70" width="5" height="5" fill="currentColor" />
      <rect x="35" y="80" width="5" height="10" fill="currentColor" /><rect x="45" y="80" width="10" height="5" fill="currentColor" /><rect x="60" y="80" width="5" height="5" fill="currentColor" /><rect x="85" y="80" width="10" height="5" fill="currentColor" />
      <rect x="50" y="90" width="15" height="5" fill="currentColor" /><rect x="75" y="90" width="5" height="5" fill="currentColor" />
    </svg>
  );
};

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"bookings" | "past">("bookings");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/bookings?userId=${user.id}`);
      const result = await res.json();
      if (result.success) {
        setBookings(result.data);
      } else {
        setError(result.message || "Failed to load bookings.");
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError("Error connecting to bookings server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking and release your seats?")) {
      return;
    }

    try {
      setCancellingId(id);
      if (!user?.id) return;
      const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const result = await res.json();
      if (result.success) {
        alert("Booking cancelled and seats released successfully!");
        fetchBookings();
      } else {
        alert(result.message || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error("Cancel booking error:", err);
      alert("Network error while trying to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const displayedBookings = bookings.filter((booking) => {
    const isActive = booking.paymentStatus === "paid" && booking.showtimeId?.date >= today;
    return activeTab === "bookings" ? isActive : !isActive;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fe] text-slate-900 pb-[100px] relative">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <button
          onClick={() => navigate("/")}
          className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 font-bold"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">Tickets</h1>
        <div className="w-8 h-8" />
      </div>

      <div className="px-4 mt-4 flex border-b border-slate-100 text-xs font-semibold bg-white select-none">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-2.5 flex-1 text-center border-b-2 transition-all ${
            activeTab === "bookings" ? "text-slate-900 border-[#5e4feb] font-black" : "text-slate-400 border-transparent"
          }`}
        >
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-2.5 flex-1 text-center border-b-2 transition-all ${
            activeTab === "past" ? "text-slate-900 border-[#5e4feb] font-black" : "text-slate-400 border-transparent"
          }`}
        >
          Past Bookings
        </button>
      </div>

      <div className="px-4 mt-6">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-[220px] bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-red-500 bg-red-50 rounded-2xl border border-red-100 px-3">
            {error}
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            {activeTab === "past" ? "No past or cancelled bookings found." : "No active bookings found."}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {displayedBookings.map((booking) => {
              const showtime = booking.showtimeId;
              const movie = showtime?.movieId;
              if (!showtime || !movie) return null;

              const showDate = new Date(showtime.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              const transactionDate = new Date(booking.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              });

              return (
                <div
                  key={booking._id}
                  className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col"
                >
                  <div className="relative h-[110px] bg-slate-200">
                    <img
                      src={movie.bannerUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/35" />
                    <div className="absolute bottom-3 left-4">
                      <span className="px-1.5 py-0.5 rounded bg-[#5e4feb] text-white text-[8px] font-black uppercase">
                        {showtime.format}
                      </span>
                      <h2 className="text-sm font-black text-slate-900 mt-1">{movie.title}</h2>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3 text-[10px]">
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <MapPin size={11} className="text-[#5e4feb] flex-shrink-0" />
                          <span className="font-bold truncate text-slate-800">{showtime.theatreName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <Calendar size={11} className="text-[#5e4feb] flex-shrink-0" />
                          <span className="font-bold text-slate-800">{showDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <Clock size={11} className="text-[#5e4feb] flex-shrink-0" />
                          <span className="font-bold text-slate-800">Screen 1 • {showtime.time}</span>
                        </div>
                        <div className="mt-1 pt-1.5 border-t border-slate-50">
                          <span className="text-slate-400 block font-bold text-[8px]">SEATS</span>
                          <span className="text-sm font-black text-[#5e4feb] mt-0.5 block">
                            {booking.seats.join(", ")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <QRCode />
                        <span className="text-[8px] font-mono text-slate-400 mt-0.5 truncate max-w-[80px] font-semibold">
                          {booking.transactionId}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold block">AMOUNT PAID</span>
                        <span className="text-xs font-black text-slate-900">₹{booking.totalPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 font-bold block">TRANSACTION DATE</span>
                        <span className="text-[9px] font-semibold text-slate-500">{transactionDate}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-3 flex justify-end">
                      {booking.paymentStatus === "paid" && showtime.date >= today ? (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="px-3.5 py-1.5 rounded-xl border border-red-500 hover:bg-red-50 text-red-500 text-[10px] font-black transition-all flex items-center gap-1.5"
                        >
                          <XCircle size={12} />
                          {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase text-slate-500">
                          {booking.paymentStatus === "cancelled" ? "Cancelled" : "Past"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BookingsPage;
