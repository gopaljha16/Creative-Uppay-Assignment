require("dotenv").config();
const express = require("express");
const cors = require("cors");
const database = require("./config/database");

const movieRoutes = require("./routes/movieRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

database()
  .then(() => {
    console.log("Database connection established.");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

let allowedOrigin = process.env.FRONTEND_URL || "*";
if (allowedOrigin !== "*") {
  allowedOrigin = allowedOrigin.replace(/\/$/, ""); // Remove trailing slash if present
}

app.use(cors({
  origin: [allowedOrigin, "http://localhost:5173", "http://localhost:3000"]
}));
app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Movie Ticket Reservation System API is running." });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ success: false, message: "Internal server error: " + err.message });
});

const PORT = process.env.PORT || process.env.PORT_NO || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});