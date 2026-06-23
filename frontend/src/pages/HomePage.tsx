import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { MapPin, Search, Star } from "lucide-react";
import BottomNavigation from "../components/common/BottomNavigation";
import { selectMovie } from "../store/bookingSlice";
import { API_URL } from "../config";

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

const movieTemplates: Movie[] = [
  {
    _id: "m1",
    title: "Meg 2: The Trench",
    bannerUrl: "/homepage/b9ca521403d1c9bc1d0fe28b9ef77c019eeeb4e6.png",
    posterUrl: "/homepage/c5b170ba76ed51a19d6efe07a6af64a38c291e62.jpg",
    description: "A research team encounters colossal threats in the deepest depths of the ocean.",
    genre: "Action, Sci-fi, Horror",
    duration: "1h 56m",
    rating: "4.5",
    releaseDate: "August 4, 2023",
    cast: [],
    formats: ["2D", "3D", "IMAX"],
    status: "now-showing",
  },
  {
    _id: "m2",
    title: "The Nun II",
    bannerUrl: "",
    posterUrl: "/homepage/faf2f1614ca7c1750dda26167cdc60459cf68fed.png",
    description: "Sister Irene once again comes face-to-face with Valak, the demon nun.",
    genre: "Horror",
    duration: "1h 50m",
    rating: "4.5",
    releaseDate: "September 8, 2023",
    cast: [],
    formats: ["2D"],
    status: "now-showing",
  },
  {
    _id: "m3",
    title: "Fast X",
    bannerUrl: "",
    posterUrl: "/homepage/a2c39e9e54c5f767f395fb9ad735523f7d1e9aed.jpg",
    description: "Dom Toretto and his family face a dangerous new enemy.",
    genre: "Action, Adventure",
    duration: "2h 21m",
    rating: "4.5",
    releaseDate: "May 19, 2023",
    cast: [],
    formats: ["2D", "IMAX"],
    status: "now-showing",
  },
  {
    _id: "m4",
    title: "John Wick: Chapter 4",
    bannerUrl: "",
    posterUrl: "/homepage/75ed6e1047cdc6d5762360af83e22439d5e2bcfd.jpg",
    description: "John Wick uncovers a path to defeating The High Table.",
    genre: "Action, Thriller",
    duration: "2h 49m",
    rating: "4.5",
    releaseDate: "March 24, 2023",
    cast: [],
    formats: ["2D", "IMAX"],
    status: "now-showing",
  },
];

const theatres = [
  {
    name: "The Grandview",
    address: "Camp Aguinaldo, Quezon City",
    price: "₱320 - ₱450",
    logo: "/homepage/adc8de2ce042b1ace396cdd0d9eb663f758d24e3.jpg",
  },
  {
    name: "Play Loft",
    address: "Aurora Boulevard, Santa Mesa",
    price: "₱300 - ₱430",
    logo: "/homepage/fdea3e35a4b503a3bd0bb61458b6119bcd58c642.png",
  },
  {
    name: "CinemaOne",
    address: "A Cruz, Pasay City",
    price: "₱320 - ₱430",
    logo: "/homepage/83fecb00c262c9bdec6d5c949c2fd2f7eea76103.png",
  },
];

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"now-showing" | "coming-soon">("now-showing");
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const loadMovies = async () => {
      try {
        const response = await fetch(API_URL + "/api/movies");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load movies.");
        }

        const hydratedMovies = result.data.map((movie: Movie) => {
          const artwork = movieTemplates.find((template) => template.title === movie.title);
          return {
            ...movie,
            bannerUrl: artwork?.bannerUrl || artwork?.posterUrl || movie.bannerUrl,
            posterUrl: artwork?.posterUrl || movie.posterUrl,
          };
        });

        if (!cancelled) setMovieList(hydratedMovies);
      } catch (error) {
        if (!cancelled) {
          setMoviesError(error instanceof Error ? error.message : "Failed to load movies.");
        }
      } finally {
        if (!cancelled) setLoadingMovies(false);
      }
    };

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayedMovies = movieList.filter((movie) => movie.status === activeTab);

  const openMovie = (movie: Movie) => {
    dispatch(selectMovie(movie));
    navigate("/movie/" + movie._id);
  };

  const tabClass = (tab: typeof activeTab) =>
    "border-b-2 pb-1.5 text-[13px] font-semibold transition-colors " +
    (activeTab === tab
      ? "border-[#5e4feb] text-[#5e4feb]"
      : "border-transparent text-slate-500");

  return (
    <main className="min-h-screen bg-white pb-20 text-[#111827]">
      <section className="relative h-[220px] w-full overflow-hidden bg-slate-200">
        <img
          src={movieTemplates[0].bannerUrl}
          alt="Meg 2: The Trench"
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          aria-label="Search"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center text-white"
        >
          <Search size={22} strokeWidth={2.5} />
        </button>
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between px-6">
          <div className="flex gap-6">
            <button type="button" onClick={() => setActiveTab("now-showing")} className={tabClass("now-showing")}>
              Now Showing
            </button>
            <button type="button" onClick={() => setActiveTab("coming-soon")} className={tabClass("coming-soon")}>
              Coming Soon
            </button>
          </div>
          <button type="button" className="text-[11px] font-semibold text-[#5e4feb]">
            View All
          </button>
        </div>

        <div className="scrollbar-none mt-5 flex gap-3.5 overflow-x-auto px-6">
          {displayedMovies.length ? (
            displayedMovies.map((movie) => (
              <article
                key={movie._id}
                onClick={() => openMovie(movie)}
                className="w-[106px] flex-none cursor-pointer"
              >
                <div className="relative h-[158px] overflow-hidden rounded-xl bg-slate-200">
                  <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-lg bg-black/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    <Star size={9} fill="currentColor" strokeWidth={0} />
                    {movie.rating}
                  </span>
                </div>
                <h2 className="mt-2 line-clamp-2 text-[13px] font-bold leading-[1.15]">{movie.title}</h2>
                <p className="mt-1 truncate text-[11px] font-medium text-slate-500">{movie.genre}</p>
              </article>
            ))
          ) : (
            <p className="w-full py-8 text-center text-xs text-slate-400">
              {loadingMovies ? "Loading movies…" : moviesError || "No movies found."}
            </p>
          )}
        </div>
      </section>

      <section className="mt-9 px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold">Movie Theatres</h2>
          <button type="button" className="text-[11px] font-semibold text-[#5e4feb]">
            View All
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {theatres.map((theatre) => (
            <article key={theatre.name} className="flex items-center gap-4 py-1.5">
              <img
                src={theatre.logo}
                alt=""
                className="h-14 w-14 flex-none rounded-[18px] object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-bold">{theatre.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-slate-500">
                  <MapPin size={11} className="flex-none text-slate-400" />
                  {theatre.address}
                </p>
                <p className="mt-1.5 text-[12px] font-bold text-[#4f46e5]">{theatre.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
};

export default HomePage;