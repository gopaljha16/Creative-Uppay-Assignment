import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Movie {
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

export interface Showtime {
  _id: string;
  movieId: string;
  theatreName: string;
  date: string;
  time: string;
  format: string;
  price: number;
}

export interface BookingState {
  selectedMovie: Movie | null;
  selectedFormat: string;
  selectedDate: string;
  selectedTheatre: string;
  selectedShowtime: Showtime | null;
  selectedSeats: string[];
  bookingFee: number;
}

const getInitialState = (): BookingState => {
  try {
    const saved = localStorage.getItem("movie_booking_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
  }
  return {
    selectedMovie: null,
    selectedFormat: "",
    selectedDate: "",
    selectedTheatre: "",
    selectedShowtime: null,
    selectedSeats: [],
    bookingFee: 20, // flat fee of ₹20
  };
};

const bookingSlice = createSlice({
  name: "booking",
  initialState: getInitialState(),
  reducers: {
    selectMovie: (state, action: PayloadAction<Movie>) => {
      state.selectedMovie = action.payload;
      // Reset subsequent flow selections on movie change
      state.selectedFormat = action.payload.formats[0] || "2D";
      state.selectedDate = "";
      state.selectedTheatre = "";
      state.selectedShowtime = null;
      state.selectedSeats = [];
    },
    selectFormat: (state, action: PayloadAction<string>) => {
      state.selectedFormat = action.payload;
      state.selectedShowtime = null;
      state.selectedSeats = [];
    },
    selectDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.selectedShowtime = null;
      state.selectedSeats = [];
    },
    selectTheatre: (state, action: PayloadAction<string>) => {
      state.selectedTheatre = action.payload;
      state.selectedShowtime = null;
      state.selectedSeats = [];
    },
    selectShowtime: (state, action: PayloadAction<Showtime>) => {
      state.selectedShowtime = action.payload;
      state.selectedSeats = [];
    },
    toggleSeat: (state, action: PayloadAction<string>) => {
      const seat = action.payload;
      if (state.selectedSeats.includes(seat)) {
        state.selectedSeats = state.selectedSeats.filter(s => s !== seat);
      } else {
        // Limit to max 6 seats
        if (state.selectedSeats.length < 6) {
          state.selectedSeats.push(seat);
        }
      }
    },
    clearBooking: (state) => {
      state.selectedMovie = null;
      state.selectedFormat = "";
      state.selectedDate = "";
      state.selectedTheatre = "";
      state.selectedShowtime = null;
      state.selectedSeats = [];
    }
  }
});

export const {
  selectMovie,
  selectFormat,
  selectDate,
  selectTheatre,
  selectShowtime,
  toggleSeat,
  clearBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;
