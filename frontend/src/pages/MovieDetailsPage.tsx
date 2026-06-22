import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Heart, Calendar, Star, Clock } from "lucide-react";
import { API_URL } from "../config";
import { RootState } from "../store/store";
import { selectMovie, selectFormat } from "../store/bookingSlice";
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
  cast: Array<{ name: string; role: string; imageUrl: string }>;
  formats: string[];
  status: "now-showing" | "coming-soon";
}

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [movie, setMovieState] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const reduxMovie = useSelector((state: RootState) => state.booking.selectedMovie);
  const selectedFormat = useSelector((state: RootState) => state.booking.selectedFormat);

  useEffect(() => {
    // If the movie in Redux matches the ID, use it. Otherwise, fetch it.
    if (reduxMovie && reduxMovie._id === id) {
      setMovieState(reduxMovie);
      setLoading(false);
    } else {
      const fetchMovie = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${API_URL}/api/movies/${id}`);
          const result = await res.json();
          if (result.success) {
            setMovieState(result.data);
            dispatch(selectMovie(result.data));
          } else {
            setError(result.message || "Failed to load movie details.");
          }
        } catch (err) {
          console.error("Fetch movie error:", err);
          setError("Could not retrieve movie details from server.");
        } finally {
          setLoading(false);
        }
      };

      fetchMovie();
    }
  }, [id, reduxMovie, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1c2e] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5b4fcf]"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#1c1c2e] text-white p-4 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-400 text-xs">{error || "Movie details not found."}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[#5b4fcf] text-white text-xs font-semibold rounded-xl hover:bg-[#4a3eaf]"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleFormatSelect = (fmt: string) => {
    dispatch(selectFormat(fmt));
  };

  const handleGetTickets = () => {
    navigate(`/schedule/${movie._id}`);
  };

  const formattedDate = new Date(movie.releaseDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-[#1c1c2e] text-white pb-[140px] relative">
      {/* Movie Banner Background */}
      <div className="relative h-[250px] w-full overflow-hidden">
        <img
          src={movie.bannerUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c2e] via-[#1c1c2e]/45 to-black/30" />

        {/* Back and Favorite Floating buttons */}
        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <Heart
              size={16}
              className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
        </div>
      </div>

      {/* Movie Details Info block */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="bg-[#252538]/90 backdrop-blur-md p-4 rounded-2xl border border-[#2e2d4d]/50 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-base font-bold leading-tight">{movie.title}</h1>
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-[#5b4fcf]/20 text-[#5b4fcf] text-[9px] font-bold border border-[#5b4fcf]/30 uppercase">
                {movie.rating}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[9px] font-bold border border-yellow-500/20 flex items-center gap-0.5">
                <Star size={8} className="fill-yellow-400 text-yellow-400" />
                4.8
              </span>
            </div>
          </div>
          <p className="text-[10px] text-[#a1a1c1] mt-1">{movie.genre}</p>

          <div className="flex items-center gap-3.5 mt-3.5 pt-3.5 border-t border-[#2e2d4d]/60 text-[#a1a1c1] text-[10px]">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#5b4fcf]" />
              {movie.duration}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-[#5b4fcf]" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Synopsis/Description */}
      <div className="px-4 mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1c1]">Synopsis</h2>
        <p className="text-xs text-white/90 leading-relaxed mt-2 text-justify">
          {movie.description}
        </p>
      </div>

      {/* Format Selection */}
      <div className="px-4 mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1c1]">Format Available</h2>
        <div className="flex gap-2.5 mt-2.5">
          {movie.formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleFormatSelect(fmt)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedFormat === fmt
                  ? "bg-[#5b4fcf] text-white border-[#5b4fcf]"
                  : "bg-transparent text-[#a1a1c1] border-[#2e2d4d] hover:border-[#5b4fcf]/65"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Cast Section */}
      <div className="px-4 mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1c1]">Cast</h2>
        <div className="mt-3 overflow-x-auto flex gap-3 pb-2 scrollbar-thin">
          {movie.cast && movie.cast.map((actor, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-[#252538]/60 p-1.5 pr-3 rounded-2xl border border-[#2e2d4d]/30 w-[140px] flex-shrink-0">
              <img
                src={actor.imageUrl}
                alt={actor.name}
                className="w-8 h-8 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold truncate text-white leading-tight">{actor.name}</h4>
                <p className="text-[8px] text-[#a1a1c1] truncate leading-tight mt-0.5">{actor.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Get Tickets Button */}
      {movie.status === "now-showing" && (
        <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-[#1c1c2e]/95 backdrop-blur-md px-4 py-3 border-t border-[#2e2d4d] z-40">
          <button
            onClick={handleGetTickets}
            className="w-full bg-[#5b4fcf] hover:bg-[#4a3eaf] active:scale-98 transition-all text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-[#5b4fcf]/20 flex items-center justify-center gap-1.5"
          >
            Get Tickets
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNavigation />
    </div>
  );
};

export default MovieDetailsPage;
