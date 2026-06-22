const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  col: { type: Number, required: true },
  status: { type: String, enum: ["available", "occupied", "locked"], default: "available" },
  userId: { type: String, default: null },
  lockedUntil: { type: Date, default: null }
}, { _id: false });

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  theatreName: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  time: { type: String, required: true }, // "HH:MM"
  format: { type: String, enum: ["2D", "3D", "IMAX"], default: "2D" },
  price: { type: Number, required: true },
  seats: [seatSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model("Showtime", showtimeSchema);
