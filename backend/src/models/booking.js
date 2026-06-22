const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk User ID
  userEmail: { type: String },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [{ type: String, required: true }], // e.g. ["A3", "A4"]
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  transactionId: { type: String, required: true },
  bookingDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);
