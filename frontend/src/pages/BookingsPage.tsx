import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../config";
import BottomNavigation from "../components/common/BottomNavigation";
import TicketQRCode from "../components/common/TicketQRCode";
import { applyMovieArtwork } from "../utils/movieArtwork";

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

const formatShowDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTransactionDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

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
      const res = await fetch(API_URL + "/api/bookings?userId=" + user.id);
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
      const res = await fetch(API_URL + "/api/bookings/" + id + "/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
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

  const tabClass = (tab: "bookings" | "past") =>
    "h-12 flex-1 border-b-2 text-sm font-black transition-colors " +
    (activeTab === tab ? "border-[#5e4feb] text-slate-950" : "border-transparent text-slate-400");

  return (
    <div className="min-h-screen bg-[#f8f9fe] pb-[92px] text-slate-950">
      <header className="relative flex h-[60px] items-center justify-center border-b border-slate-100 bg-white px-5">
        <button
          onClick={() => navigate("/")}
          className="absolute left-5 flex items-center gap-1.5 text-sm font-bold text-slate-400"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-sm font-black uppercase tracking-wide text-slate-950">Tickets</h1>
      </header>


      <div className="flex bg-white px-5">
        <button type="button" onClick={() => setActiveTab("bookings")} className={tabClass("bookings")}>
          My Bookings
        </button>
        <button type="button" onClick={() => setActiveTab("past")} className={tabClass("past")}>
          Past Bookings
        </button>
      </div>

      <main className="px-5 pt-7">
        {loading ? (
          <div className="flex flex-col gap-7">
            {[1, 2].map((n) => (
              <div key={n} className="h-[520px] animate-pulse rounded-md bg-white shadow-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-8 text-center text-xs text-red-500">
            {error}
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            {activeTab === "past" ? "No past or cancelled bookings found." : "No active bookings found."}
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            {displayedBookings.map((booking) => {
              const showtime = booking.showtimeId;
              const movie = showtime?.movieId ? applyMovieArtwork(showtime.movieId) : null;
              if (!showtime || !movie) return null;

              const transactionCode = booking.transactionId
                ? "TXN - " + booking.transactionId.slice(-6).toUpperCase()
                : "TXN - 574928";

              return (
                <article
                  key={booking._id}
                  className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.14)]"
                >
                  <img
                    src={movie.posterUrl || movie.bannerUrl}
                    alt={movie.title}
                    className="h-[180px] w-full object-cover object-center"
                  />

                  <div className="px-5 pb-5 pt-4">
                    <h2 className="text-[17px] font-black leading-tight text-slate-950">{movie.title}</h2>

                    <div className="mt-5 grid grid-cols-2 gap-y-4 text-[13px]">
                      <div className="font-bold text-slate-950">
                        {showtime.theatreName}
                      </div>
                      <div className="font-bold text-slate-950 text-right">
                        Screen 1 - 2D
                      </div>

                      <div className="font-semibold text-slate-500">
                        {formatShowDate(showtime.date)}
                      </div>
                      <div className="font-semibold text-slate-500 text-right">
                        {showtime.time}
                      </div>

                      <div className="font-bold text-slate-950 mt-1">
                        Seats:
                      </div>
                      <div className="font-bold text-slate-950 mt-1 text-right">
                        Amount Paid:
                      </div>

                      <div className="flex flex-wrap gap-1.5 -mt-2">
                        {booking.seats.map((seat) => (
                          <span key={seat} className="rounded bg-slate-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                            {seat}
                          </span>
                        ))}
                      </div>
                      <div className="font-semibold text-slate-500 text-right -mt-2">
                        ₹{booking.totalPrice}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-start">
                      <div className="flex flex-col items-start">
                        {booking.paymentStatus === "paid" && showtime.date >= today ? (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="rounded border border-red-500 px-3 py-1.5 text-[11px] font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60 mb-3"
                          >
                            {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                          </button>
                        ) : (
                          <span className="rounded bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase text-slate-500 mb-3">
                            {booking.paymentStatus === "cancelled" ? "Cancelled" : "Past"}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-slate-600 mb-1">{transactionCode}</span>
                        <span className="text-[11px] text-slate-400">Transaction Date:</span>
                        <span className="text-[11px] text-slate-400">{formatTransactionDate(booking.createdAt)}</span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <TicketQRCode size={75} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default BookingsPage;
