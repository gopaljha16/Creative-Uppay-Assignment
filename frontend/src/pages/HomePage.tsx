import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { Search, MapPin } from "lucide-react";
import { API_URL } from "../config";
import { selectMovie } from "../store/bookingSlice";
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

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"now-showing" | "coming-soon">("now-showing");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/movies`);
        const result = await res.json();
        if (result.success) {
          setMovies(result.data);
        } else {
          setError(result.message || "Failed to load movies.");
        }
      } catch (err) {
        console.error("Fetch movies error:", err);
        setError("Could not connect to server. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const nowShowing = movies.filter((m) => m.status === "now-showing");
  const comingSoon = movies.filter((m) => m.status === "coming-soon");
  const displayedMovies = activeTab === "now-showing" ? nowShowing : comingSoon;

  // Static list of theatres, styled beautifully to match Figma
  const theatresList = [
    {
      name: "PVR: Dynamix Mall, Juhu",
      address: "Juhu Road, Vile Parle West, Mumbai",
      price: "₹200 - ₹300",
      emoji: "🎬",
      color: "from-purple-500 to-indigo-500"
    },
    {
      name: "Inox: R-City Mall, Ghatkopar",
      address: "LBS Marg, Ghatkopar West, Mumbai",
      price: "₹180 - ₹280",
      emoji: "🍿",
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "Cinepolis: Fun Republic, Andheri",
      address: "Link Road, Andheri West, Mumbai",
      price: "₹220 - ₹320",
      emoji: "🎥",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const handleMovieClick = (movie: Movie) => {
    dispatch(selectMovie(movie));
    navigate(`/movie/${movie._id}`);
  };

  return (
    <div className="min-height-[100vh] bg-[#1c1c2e] text-white pb-[80px]">
      {/* Hero Header Banner */}
      <div className="relative h-[220px] w-full overflow-hidden bg-gradient-to-b from-[#2e2d4d] to-[#1c1c2e]">
        {movies.length > 0 ? (
          <img
            src={movies[0].bannerUrl}
            alt="Featured Movie"
            className="w-full h-full object-cover opacity-60 filter blur-[1px]"
          />
        ) : (
          <div className="w-full h-full bg-[#2e2d4d] animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c2e] via-transparent to-black/40" />

        {/* Location Header & Search Icon */}
        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
            <MapPin size={14} className="text-[#5b4fcf]" />
            <span>Mumbai, India</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors">
            <Search size={16} className="text-white" />
          </button>
        </div>

        {/* Brand Text Overlay */}
        <div className="absolute bottom-4 left-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5b4fcf]">Featured</h2>
          <h1 className="text-lg font-bold mt-0.5">
            {movies.length > 0 ? movies[0].title : "Spider-Man: Beyond the Spider-Verse"}
          </h1>
        </div>
      </div>

      {/* Categories Tabs & View All */}
      <div className="px-4 mt-6 flex items-center justify-between">
        <div className="flex gap-4 text-sm font-semibold select-none">
          <button
            onClick={() => setActiveTab("now-showing")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "now-showing" ? "text-white border-[#5b4fcf]" : "text-[#a1a1c1] border-transparent"
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setActiveTab("coming-soon")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "coming-soon" ? "text-white border-[#5b4fcf]" : "text-[#a1a1c1] border-transparent"
            }`}
          >
            Coming Soon
          </button>
        </div>
        <span className="text-xs text-[#5b4fcf] font-medium cursor-pointer">View All</span>
      </div>

      {/* Horizontal Scroll Movies List */}
      <div className="mt-4 px-4 overflow-x-auto flex gap-4 scrollbar-thin scrollbar-thumb-[#5b4fcf]">
        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-[140px] flex-shrink-0 animate-pulse">
                <div className="h-[200px] bg-[#2e2d4d] rounded-2xl" />
                <div className="h-4 bg-[#2e2d4d] rounded mt-2 w-3/4" />
                <div className="h-3 bg-[#2e2d4d] rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 w-full text-center text-xs text-red-400 bg-red-900/10 rounded-2xl border border-red-500/20 px-3">
            {error}
          </div>
        ) : displayedMovies.length === 0 ? (
          <div className="py-8 w-full text-center text-xs text-[#a1a1c1]">No movies found.</div>
        ) : (
          displayedMovies.map((movie) => (
            <div
              key={movie._id}
              onClick={() => handleMovieClick(movie)}
              className="w-[140px] flex-shrink-0 cursor-pointer group"
            >
              <div className="relative h-[200px] w-full overflow-hidden rounded-2xl bg-[#2e2d4d] transition-transform duration-300 group-hover:scale-95 shadow-md">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Rating badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-yellow-400 flex items-center gap-0.5">
                  ★ 4.8
                </div>
              </div>
              <h3 className="text-xs font-bold mt-2 truncate line-clamp-1 group-hover:text-[#5b4fcf] transition-colors">
                {movie.title}
              </h3>
              <p className="text-[10px] text-[#a1a1c1] mt-0.5 truncate">{movie.genre}</p>
            </div>
          ))
        )}
      </div>

      {/* Theatres Section */}
      <div className="mt-8 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Movie Theatres</h2>
          <span className="text-xs text-[#5b4fcf] font-medium cursor-pointer">View All</span>
        </div>

        {/* Vertical Scroll list */}
        <div className="mt-4 flex flex-col gap-3">
          {theatresList.map((theatre, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 bg-[#252538] hover:bg-[#2b2b40] transition-colors p-3.5 rounded-2xl border border-[#2e2d4d]/50"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${theatre.color} flex items-center justify-center text-lg shadow-sm`}>
                {theatre.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-white truncate">{theatre.name}</h3>
                <p className="text-[9px] text-[#a1a1c1] mt-0.5 truncate flex items-center gap-0.5">
                  <MapPin size={10} className="text-[#a1a1c1]" />
                  {theatre.address}
                </p>
                <p className="text-[10px] text-[#5b4fcf] font-semibold mt-1">{theatre.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
