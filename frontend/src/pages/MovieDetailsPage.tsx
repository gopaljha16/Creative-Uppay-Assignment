import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Star } from "lucide-react";
import { API_URL } from "../config";
import type { RootState } from "../store/store";
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
      <div className="min-h-screen bg-[#f8f9fe] text-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5e4feb]"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#f8f9fe] text-slate-900 p-4 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-500 text-xs font-semibold">{error || "Movie details not found."}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[#5e4feb] text-white text-xs font-bold rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const detailArtwork: Record<string, string> = {
    "Meg 2: The Trench": "/booking/a57fc1c3fabe76e17c91003a155cf85d5a12aeb3.jpg",
    "The Nun II": "/homepage/faf2f1614ca7c1750dda26167cdc60459cf68fed.png",
  };

  const heroImage = detailArtwork[movie.title] || movie.bannerUrl || movie.posterUrl;

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
    <div className="min-h-screen bg-white text-slate-900 pb-[140px] relative">
      <div className="relative h-[250px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.src !== movie.posterUrl) {
              image.src = movie.posterUrl;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />

        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate("/")}
            className="text-white text-xs font-bold hover:opacity-80 transition-opacity drop-shadow-md"
          >
            Close
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/35 transition-colors"
          >
            <Heart
              size={16}
              className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 relative z-10 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 leading-tight">{movie.title}</h1>
            <span className="px-1.5 py-0.5 rounded-md border border-[#5e4feb]/30 text-[#5e4feb] text-[9px] font-black uppercase tracking-wide">
              {movie.rating}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-800 text-xs font-bold flex-shrink-0">
            <Star size={12} className="fill-slate-800 text-slate-800" />
            <span>5.1</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 font-bold">{movie.genre}</p>

        <p className="text-xs text-slate-500 leading-relaxed mt-4 font-medium text-justify">
          {movie.description}
        </p>

        <div className="mt-5">
          <h2 className="text-xs font-black text-slate-900">Format Available</h2>
          <div className="flex gap-2 mt-2">
            {movie.formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleFormatSelect(fmt)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all ${
                  selectedFormat === fmt
                    ? "bg-[#5e4feb] text-white border-[#5e4feb]"
                    : "bg-white text-[#5e4feb] border-[#5e4feb]/40 hover:bg-blue-50/20"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-xs font-black text-slate-900">Release Date</h2>
          <p className="text-xs text-slate-500 font-bold mt-1.5">{formattedDate}</p>
        </div>

        <div className="mt-5">
          <h2 className="text-xs font-black text-slate-900">Cast</h2>
          <div className="mt-3 overflow-x-auto flex gap-4 pb-2 scrollbar-none">
            {movie.cast && movie.cast.map((actor, idx) => (
               <div key={idx} className="flex items-center gap-2 flex-shrink-0 min-w-[130px]">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                  <img
                    src={actor.imageUrl}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black truncate text-slate-800 leading-tight">{actor.name}</h4>
                  <p className="text-[8px] text-slate-400 truncate leading-tight mt-0.5 font-medium">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {movie.status === "now-showing" && (
        <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 max-w-[390px] w-full bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-100 z-40">
          <button
            onClick={handleGetTickets}
            className="w-full bg-[#5e4feb] hover:bg-[#4f46e5] active:scale-98 transition-all text-white text-xs font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            Get Tickets
          </button>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default MovieDetailsPage;
