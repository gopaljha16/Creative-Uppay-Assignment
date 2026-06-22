import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MapPin } from "lucide-react";
import { API_URL } from "../config";
import { RootState } from "../store/store";
import { selectDate, selectTheatre, selectFormat, selectShowtime } from "../store/bookingSlice";
import BottomNavigation from "../components/common/BottomNavigation";

interface Showtime {
  _id: string;
  movieId: string;
  theatreName: string;
  date: string;
  time: string;
  format: string;
  price: number;
}

interface DateItem {
  dayName: string;
  dayNum: number;
  dateStr: string;
}

const SchedulingPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const movie = useSelector((state: RootState) => state.booking.selectedMovie);
  const selectedDate = useSelector((state: RootState) => state.booking.selectedDate);
  const selectedTheatre = useSelector((state: RootState) => state.booking.selectedTheatre);
  const selectedFormat = useSelector((state: RootState) => state.booking.selectedFormat);
  const selectedShowtimeState = useSelector((state: RootState) => state.booking.selectedShowtime);

  const [step, setStep] = useState<"theatre" | "time">("theatre");
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [dates, setDates] = useState<DateItem[]>([]);

  // Generate 7 days dynamically
  useEffect(() => {
    const list: DateItem[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push({
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        dateStr: d.toISOString().split("T")[0]
      });
    }
    setDates(list);
    
    // Default to today
    if (!selectedDate && list.length > 0) {
      dispatch(selectDate(list[0].dateStr));
    }
  }, [dispatch, selectedDate]);

  // Fetch showtimes for selected date
  useEffect(() => {
    if (!movieId || !selectedDate) return;

    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_URL}/api/showtimes?movieId=${movieId}&date=${selectedDate}`);
        const result = await res.json();
        if (result.success) {
          setShowtimes(result.data);
        } else {
          setError(result.message || "Failed to load showtimes.");
        }
      } catch (err) {
        console.error("Fetch showtimes error:", err);
        setError("Error connecting to showtimes server.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId, selectedDate]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#1c1c2e] text-white flex flex-col items-center justify-center p-4">
        <p className="text-xs text-[#a1a1c1]">No movie selected.</p>
        <button onClick={() => navigate("/")} className="mt-3 px-4 py-2 bg-[#5b4fcf] text-xs rounded-xl">
          Go Home
        </button>
      </div>
    );
  }

  // Filter showtimes by step selection
  const uniqueTheatres = Array.from(new Set(showtimes.map((s) => s.theatreName))).map((name) => {
    const matches = showtimes.filter((s) => s.theatreName === name);
    const minPrice = Math.min(...matches.map((s) => s.price));
    const maxPrice = Math.max(...matches.map((s) => s.price));
    return {
      name,
      address: name.includes("Grandview") ? "Camp Aguinaldo, Quezon City" :
               name.includes("Play Loft") ? "Aurora Boulevard, Santa Mesa" :
               name.includes("CinemaOne") ? "A Cruz, Pasay City" : "Baclaran, Paranaque City",
      priceRange: minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`,
      emoji: name.includes("Grandview") ? "🎬" : name.includes("Play Loft") ? "🍿" : name.includes("CinemaOne") ? "🎥" : "🎞️",
      color: name.includes("Grandview") ? "from-purple-500 to-indigo-500" :
             name.includes("Play Loft") ? "from-pink-500 to-rose-500" :
             name.includes("CinemaOne") ? "from-blue-500 to-cyan-500" : "from-yellow-500 to-amber-500"
    };
  });

  const activeShowtimes = showtimes.filter(
    (s) => s.theatreName === selectedTheatre && s.format === selectedFormat
  );

  // Split slots into Screen 1 and Screen 2
  const screen1Times = activeShowtimes.filter((s, idx) => idx % 2 === 0);
  const screen2Times = activeShowtimes.filter((s, idx) => idx % 2 !== 0);

  const handleTheatreSelect = (name: string) => {
    dispatch(selectTheatre(name));
    setStep("time");
  };

  const handleTimeSelect = (slot: Showtime) => {
    dispatch(selectShowtime(slot));
  };

  const handleGetTickets = () => {
    if (!selectedShowtimeState) {
      alert("Please select a showtime slot first!");
      return;
    }
    navigate(`/seats/${selectedShowtimeState._id}`);
  };

  const formattedDateHeader = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      })
    : "";

  return (
    <div className="min-h-screen bg-[#1c1c2e] text-white pb-[140px] relative">
      {/* Header bar */}
      <div className="p-4 border-b border-[#2e2d4d] flex items-center justify-between">
        <button
          onClick={() => {
            if (step === "time") {
              setStep("theatre");
            } else {
              navigate(`/movie/${movie._id}`);
            }
          }}
          className="text-xs text-[#a1a1c1] flex items-center gap-1 hover:text-white"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => navigate("/")} className="text-xs text-[#a1a1c1] hover:text-white">
          Cancel
        </button>
      </div>

      {/* Movie Details Info Strip */}
      <div className="px-4 py-3 bg-[#252538]/40">
        <h1 className="text-sm font-bold text-white">{movie.title}</h1>
        <p className="text-[10px] text-[#a1a1c1] mt-0.5">
          {step === "theatre" ? movie.genre : `${selectedTheatre} • ${formattedDateHeader}`}
        </p>
      </div>

      {/* Progress line */}
      <div className="w-full bg-[#2e2d4d] h-1 relative">
        <div
          className="bg-[#5b4fcf] h-1 absolute left-0 top-0 transition-all duration-300"
          style={{ width: step === "theatre" ? "25%" : "50%" }}
        />
      </div>

      {/* Step 1: Select Movie Theatre */}
      {step === "theatre" && (
        <div className="mt-4">
          <h2 className="px-4 text-xs font-bold uppercase tracking-wider text-[#a1a1c1]">Select Movie Theatre</h2>

          {/* Horizontal Date Picker */}
          <div className="mt-3 overflow-x-auto flex gap-2.5 px-4 pb-2 scrollbar-none">
            {dates.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => dispatch(selectDate(d.dateStr))}
                  className={`flex flex-col items-center justify-center w-11 py-2 rounded-2xl transition-all border flex-shrink-0 ${
                    isSelected
                      ? "bg-[#5b4fcf] text-white border-[#5b4fcf] shadow-md"
                      : "bg-[#252538] text-[#a1a1c1] border-[#2e2d4d]/60"
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-tight opacity-75">{d.dayName}</span>
                  <span className="text-xs font-black mt-0.5">{d.dayNum}</span>
                </button>
              );
            })}
          </div>

          {/* Theatres List */}
          <div className="px-4 mt-5 flex flex-col gap-3">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-16 w-full bg-[#2e2d4d] rounded-2xl animate-pulse" />
              ))
            ) : error ? (
              <div className="py-8 text-center text-xs text-red-400">{error}</div>
            ) : uniqueTheatres.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#a1a1c1]">No theatres showing on this date.</div>
            ) : (
              uniqueTheatres.map((theatre, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTheatreSelect(theatre.name)}
                  className="flex items-center gap-3.5 bg-[#252538] hover:bg-[#2b2b40] transition-colors p-3.5 rounded-2xl border border-[#2e2d4d]/50 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theatre.color} flex items-center justify-center text-base shadow-sm`}>
                    {theatre.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white truncate">{theatre.name}</h3>
                    <p className="text-[9px] text-[#a1a1c1] mt-0.5 truncate flex items-center gap-0.5">
                      <MapPin size={9} />
                      {theatre.address}
                    </p>
                    <p className="text-[10px] text-[#5b4fcf] font-semibold mt-1">{theatre.priceRange}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 2: Choose Schedule */}
      {step === "time" && (
        <div className="mt-4 px-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#a1a1c1]">Choose Schedule</h2>

          {/* Format selection */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {movie.formats.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => dispatch(selectFormat(fmt))}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedFormat === fmt
                      ? "bg-[#5b4fcf] text-white border-[#5b4fcf]"
                      : "bg-transparent text-[#a1a1c1] border-[#2e2d4d]"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-[#a1a1c1] font-semibold">
              {selectedFormat === "3D" ? "₹350 - ₹400" : "₹300 - ₹320"}
            </span>
          </div>

          {/* Slots List */}
          <div className="mt-6 flex flex-col gap-6">
            {loading ? (
              <div className="h-24 bg-[#2e2d4d] rounded-2xl animate-pulse" />
            ) : activeShowtimes.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#a1a1c1]">No slots available for {selectedFormat} format.</div>
            ) : (
              <>
                {/* Screen 1 */}
                {screen1Times.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white mb-2.5">Screen 1</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {screen1Times.map((slot) => {
                        const isSelected = selectedShowtimeState?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            onClick={() => handleTimeSelect(slot)}
                            className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#5b4fcf] text-white border-[#5b4fcf] shadow-md shadow-[#5b4fcf]/10"
                                : "bg-[#252538] text-[#a1a1c1] border-[#2e2d4d]"
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Screen 2 */}
                {screen2Times.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white mb-2.5">Screen 2</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {screen2Times.map((slot) => {
                        const isSelected = selectedShowtimeState?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            onClick={() => handleTimeSelect(slot)}
                            className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#5b4fcf] text-white border-[#5b4fcf] shadow-md shadow-[#5b4fcf]/10"
                                : "bg-[#252538] text-[#a1a1c1] border-[#2e2d4d]"
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sticky Get Tickets Button */}
          <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-[#1c1c2e]/95 backdrop-blur-md px-4 py-3 border-t border-[#2e2d4d] z-40">
            <button
              onClick={handleGetTickets}
              disabled={!selectedShowtimeState}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                selectedShowtimeState
                  ? "bg-[#5b4fcf] hover:bg-[#4a3eaf] text-white shadow-lg shadow-[#5b4fcf]/15"
                  : "bg-[#252538] text-[#a1a1c1] border border-[#2e2d4d]/60 cursor-not-allowed opacity-50"
              }`}
            >
              Get Tickets
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNavigation />
    </div>
  );
};

export default SchedulingPage;
