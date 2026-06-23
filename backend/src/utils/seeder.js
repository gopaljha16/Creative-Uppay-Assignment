const mongoose = require("mongoose");
const Movie = require("../models/movie");
const Showtime = require("../models/showtime");
const Booking = require("../models/booking");
require("dotenv").config();

const moviesData = [
  {
    title: "Meg 2: The Trench",
    bannerUrl: "https://image.tmdb.org/t/p/w1280/qlxy8yo5bcgUw2KAmmojUKp4rHd.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/4m1L6B62M5sNlWw3c1D2sX8rFf.jpg",
    description: "A research team encounters multiple threats while exploring the depths of the ocean, including a malevolent mining operation and colossal prehistoric predators.",
    genre: "Action, Sci-Fi, Horror",
    duration: "1h 56m",
    rating: "PG-13",
    releaseDate: new Date("2026-06-10"),
    cast: [
      { name: "Jason Statham", role: "Jonas Taylor", imageUrl: "https://image.tmdb.org/t/p/w185/lldeQ91GwIVff43JBrpdbAAeYWj.jpg" },
      { name: "Jing Wu", role: "Jiuming Zhang", imageUrl: "https://image.tmdb.org/t/p/w185/cFuATO6PnffJXtsYF7BRqhCXlwe.jpg" },
      { name: "Shuya Sophia Cai", role: "Meiying", imageUrl: "https://image.tmdb.org/t/p/w185/8zzSyNhoFJQ3eRqaqIgiryoONJB.jpg" }
    ],
    formats: ["2D", "3D"],
    status: "now-showing"
  },
  {
    title: "The Nun II",
    bannerUrl: "https://image.tmdb.org/t/p/w1280/4HodYYKEIs4g94hF3lX31h35YtB.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/5gqr4bLpFZLVVjhcT8246hZpL9L.jpg",
    description: "1956 – France. A priest is murdered. An evil is spreading. The sequel to the worldwide smash hit follows Sister Irene as she once again comes face-to-face with Valak, the demon nun.",
    genre: "Horror",
    duration: "1h 50m",
    rating: "A",
    releaseDate: new Date("2026-09-08"),
    cast: [
      { name: "Taissa Farmiga", role: "Sister Irene", imageUrl: "https://image.tmdb.org/t/p/w185/kC2Movbs6uEF8DdDhvyHizQHuru.jpg" }
    ],
    formats: ["2D"],
    status: "now-showing"
  },
  {
    title: "Fast X",
    bannerUrl: "https://image.tmdb.org/t/p/w1280/2e7fc8eNwLXZ5Uvehvl3xj8wVyv.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
    description: "Dom Toretto and his family must protect themselves from a new lethal adversary who is fueled by a blood-soaked revenge from the past.",
    genre: "Action, Adventure",
    duration: "2h 21m",
    rating: "UA",
    releaseDate: new Date("2026-05-19"),
    cast: [
      { name: "Vin Diesel", role: "Dominic Toretto", imageUrl: "https://image.tmdb.org/t/p/w185/nZdVry7lnUkE24PnXakok9okvL4.jpg" }
    ],
    formats: ["2D", "3D", "IMAX"],
    status: "coming-soon"
  },
  {
    title: "John Wick: Chapter 4",
    bannerUrl: "https://image.tmdb.org/t/p/w1280/h8gHn0OzBoaefsYseUByqsmEDMY.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    description: "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances.",
    genre: "Action, Thriller",
    duration: "2h 49m",
    rating: "A",
    releaseDate: new Date("2026-03-24"),
    cast: [
      { name: "Keanu Reeves", role: "John Wick", imageUrl: "https://image.tmdb.org/t/p/w185/kEoUZKEG7dzbCESDjd0CKAN1r0n.jpg" }
    ],
    formats: ["2D", "IMAX"],
    status: "coming-soon"
  }
];

const theatres = [
  { name: "The Grandview", address: "Camp Aguinaldo, Quezon City", basePrice: 320 },
  { name: "Play Loft", address: "Aurora Boulevard, Santa Mesa", basePrice: 300 },
  { name: "CinemaOne", address: "A Cruz, Pasay City", basePrice: 320 },
  { name: "Cinemount", address: "Baclaran, Paranaque City", basePrice: 350 }
];

const showtimesList = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];

function generateSeats() {
  const seats = [];
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  for (let r of rows) {
    for (let c = 1; c <= 12; c++) {
      const isOccupied = Math.random() < 0.2;
      seats.push({
        row: r,
        col: c,
        status: isOccupied ? "occupied" : "available",
        userId: isOccupied ? "mock_user_123" : null,
        lockedUntil: null
      });
    }
  }
  return seats;
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected. Clearing old data...");

    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await Booking.deleteMany({});

    console.log("Seeding Movies...");
    const movies = await Movie.insertMany(moviesData);
    console.log(`Successfully seeded ${movies.length} movies.`);

    console.log("Generating Showtimes...");
    const nowShowingMovies = movies.filter(m => m.status === "now-showing");
    const showtimesToInsert = [];

    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      for (let movie of nowShowingMovies) {
        for (let theatre of theatres) {
          for (let format of movie.formats) {
            let price = theatre.basePrice;
            if (format === "IMAX") price += 100;
            else if (format === "3D") price += 50;

            for (let time of showtimesList) {
              showtimesToInsert.push({
                movieId: movie._id,
                theatreName: theatre.name,
                date: dateStr,
                time: time,
                format: format,
                price: price,
                seats: generateSeats()
              });
            }
          }
        }
      }
    }

    console.log(`Inserting ${showtimesToInsert.length} showtimes...`);
    await Showtime.insertMany(showtimesToInsert);
    console.log("Successfully seeded showtimes!");

    mongoose.connection.close();
    console.log("Database seed complete.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
