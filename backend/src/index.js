require("dotenv").config();
const express = require("express");
const cors = require("cors");
const database = require("./config/database");

const movieRoutes = require("./routes/movieRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Connect to MongoDB
database()
  .then(() => {
    console.log("Database connection established.");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/movies", movieRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);

// Base route for check
app.get("/", (req, res) => {
  res.json({ message: "Movie Ticket Reservation System API is running." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandle Server Error:", err);
  res.status(500).json({ success: false, message: "Internal server error: " + err.message });
});

const PORT_NO = process.env.PORT_NO || 3000;

app.listen(PORT_NO, () => {
  console.log(`Server is running on port No ${PORT_NO}`);
});