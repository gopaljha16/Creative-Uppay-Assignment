const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userEmail: { type: String },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [{ type: String, required: true }],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending" },
  transactionId: { type: String, required: true },
  bookingDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);
