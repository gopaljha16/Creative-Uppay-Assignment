import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MapPin } from "lucide-react";
import { API_URL } from "../config";
import type { RootState } from "../store/store";
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

const GrandviewLogo = () => (
  <div className="w-10 h-10 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-800 p-1 flex-shrink-0 border border-slate-200">
    <svg className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
    <span className="text-[5px] font-bold tracking-tighter uppercase leading-none mt-0.5">CINEMA</span>
  </div>
);

const PlayLoftLogo = () => (
  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 flex-shrink-0 border border-emerald-100">
    <svg className="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a15 15 0 0 0-9 9c0 4.5 3.5 8 8.5 8s8.5-3.5 8.5-8a15 15 0 0 0-8-9Z" />
      <path d="M12 2v17" />
    </svg>
  </div>
);

const CinemaOneLogo = () => (
  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-800 flex-shrink-0 border border-blue-100">
    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">
      C1
    </div>
  </div>
);

const CinemountLogo = () => (
  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-800 flex-shrink-0 border border-amber-100">
    <svg className="w-5 h-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  </div>
);

const getTheatreLogo = (name: string) => {
  if (name.includes("Grandview")) return <GrandviewLogo />;
  if (name.includes("Play Loft")) return <PlayLoftLogo />;
  if (name.includes("CinemaOne")) return <CinemaOneLogo />;
  return <CinemountLogo />;
};

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
    
    if (!selectedDate && list.length > 0) {
      dispatch(selectDate(list[0].dateStr));
    }
  }, [dispatch, selectedDate]);

  useEffect(() => {
    if (!movieId || !selectedDate) return;

    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        setError("");
        if (!/^[a-f\d]{24}$/i.test(movieId)) {
          const moviesResponse = await fetch(API_URL + "/api/movies");
          const moviesResult = await moviesResponse.json();
          const matchingMovie = moviesResult.data?.find(
            (item: { _id: string; title: string }) => item.title === movie?.title
          );

          if (!matchingMovie) {
            throw new Error("The selected movie is no longer available.");
          }

          navigate("/schedule/" + matchingMovie._id, { replace: true });
          return;
        }

        const res = await fetch(
          API_URL + "/api/showtimes?movieId=" + movieId + "&date=" + selectedDate
        );
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
  }, [movieId, selectedDate, movie?.title, navigate]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] text-slate-900 flex flex-col items-center justify-center p-4">
        <p className="text-xs text-slate-500">No movie selected.</p>
        <button onClick={() => navigate("/")} className="mt-3 px-4 py-2 bg-[#5e4feb] text-white text-xs rounded-xl">
          Go Home
        </button>
      </div>
    );
  }

  const uniqueTheatres = Array.from(new Set(showtimes.map((s) => s.theatreName))).map((name) => {
    const matches = showtimes.filter((s) => s.theatreName === name);
    const minPrice = Math.min(...matches.map((s) => s.price));
    const maxPrice = Math.max(...matches.map((s) => s.price));
    return {
      name,
      address: name.includes("Grandview") ? "Camp Aguinaldo, Quezon City" :
               name.includes("Play Loft") ? "Aurora Boulevard, Santa Mesa" :
               name.includes("CinemaOne") ? "A Cruz, Pasay City" : "Baclaran, Paranaque City",
      priceRange: minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`
    };
  });

  const activeShowtimes = showtimes.filter(
    (s) => s.theatreName === selectedTheatre && s.format === selectedFormat
  );

  const screen1Times = activeShowtimes.filter((_, idx) => idx % 2 === 0);
  const screen2Times = activeShowtimes.filter((_, idx) => idx % 2 !== 0);

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
    <div className="min-h-screen bg-[#f8f9fe] text-slate-900 pb-[140px] relative">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <button
          onClick={() => {
            if (step === "time") {
              setStep("theatre");
            } else {
              navigate(`/movie/${movie._id}`);
            }
          }}
          className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 font-bold"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => navigate("/")} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
          Cancel
        </button>
      </div>

      <div className="px-4 py-3 bg-white">
        <h1 className="text-sm font-black text-slate-900">{movie.title}</h1>
        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
          {step === "theatre" ? movie.genre : `${selectedTheatre} • ${formattedDateHeader}`}
        </p>
      </div>

      <div className="w-full bg-slate-100 h-1.5 relative">
        <div
          className="bg-[#5e4feb] h-1.5 absolute left-0 top-0 transition-all duration-300"
          style={{ width: step === "theatre" ? "25%" : "50%" }}
        />
      </div>

      {step === "theatre" && (
        <div className="mt-4">
          <h2 className="px-4 text-xs font-black uppercase tracking-wider text-slate-400">Select Movie Theatre</h2>

          <div className="mt-3 overflow-x-auto flex gap-2.5 px-4 pb-2 scrollbar-none">
            {dates.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => dispatch(selectDate(d.dateStr))}
                  className={`flex flex-col items-center justify-center w-11 py-2.5 rounded-2xl transition-all border flex-shrink-0 ${
                    isSelected
                      ? "bg-[#5e4feb] text-white border-[#5e4feb] shadow-sm"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-tight opacity-75">{d.dayName}</span>
                  <span className="text-xs font-black mt-0.5">{d.dayNum}</span>
                </button>
              );
            })}
          </div>

          <div className="px-4 mt-5 flex flex-col gap-3">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : error ? (
              <div className="py-8 text-center text-xs text-red-500">{error}</div>
            ) : uniqueTheatres.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No theatres showing on this date.</div>
            ) : (
              uniqueTheatres.map((theatre, idx) => (
                <div
                  key={idx}
                  onClick={() => handleTheatreSelect(theatre.name)}
                  className="flex items-center gap-3.5 bg-white hover:bg-slate-50 transition-colors p-3.5 rounded-2xl border border-slate-100 cursor-pointer shadow-sm"
                >
                  {getTheatreLogo(theatre.name)}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-black text-slate-900 truncate">{theatre.name}</h3>
                    <p className="text-[9px] text-slate-400 mt-0.5 truncate flex items-center gap-0.5 font-medium">
                      <MapPin size={9} />
                      {theatre.address}
                    </p>
                    <p className="text-[10px] text-[#5e4feb] font-bold mt-1">{theatre.priceRange}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {step === "time" && (
        <div className="mt-4 px-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Choose Schedule</h2>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {movie.formats.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => dispatch(selectFormat(fmt))}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedFormat === fmt
                      ? "bg-[#5e4feb] text-white border-[#5e4feb]"
                      : "bg-white text-[#5e4feb] border-[#5e4feb] hover:bg-blue-50/40"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-bold">
              {selectedFormat === "3D" ? "₹350 - ₹400" : "₹300 - ₹320"}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            {loading ? (
              <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ) : activeShowtimes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No slots available for {selectedFormat} format.</div>
            ) : (
              <>
                {screen1Times.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 mb-2.5">Screen 1</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {screen1Times.map((slot) => {
                        const isSelected = selectedShowtimeState?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            onClick={() => handleTimeSelect(slot)}
                            className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#5e4feb] text-white border-[#5e4feb]"
                                : "bg-white text-[#5e4feb] border-[#5e4feb] hover:bg-blue-50/40"
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {screen2Times.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 mb-2.5">Screen 2</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {screen2Times.map((slot) => {
                        const isSelected = selectedShowtimeState?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            onClick={() => handleTimeSelect(slot)}
                            className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                              isSelected
                                ? "bg-[#5e4feb] text-white border-[#5e4feb]"
                                : "bg-white text-[#5e4feb] border-[#5e4feb] hover:bg-blue-50/40"
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

          <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-100 z-40">
            <button
              onClick={handleGetTickets}
              disabled={!selectedShowtimeState}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                selectedShowtimeState
                  ? "bg-[#5e4feb] hover:bg-[#4f46e5] text-white shadow-md"
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
              }`}
            >
              Get Tickets
            </button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default SchedulingPage;
