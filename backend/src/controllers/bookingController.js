const Booking = require("../models/booking");
const Showtime = require("../models/showtime");
const mongoose = require("mongoose");

function validateLuhn(cardNumber) {
  const digitsOnly = cardNumber.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(digitsOnly)) return false;

  let sum = 0;
  let shouldDouble = false;
  
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
}

function validateExpiry(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [monthStr, yearStr] = expiry.split("/");
  const month = parseInt(monthStr, 10);
  const year = parseInt("20" + yearStr, 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { showtimeId, seats, userId, userEmail, totalPrice, paymentMethod, cardDetails } = req.body;

    if (!showtimeId || !seats || !seats.length || !userId || !totalPrice) {
      return res.status(400).json({ success: false, message: "Missing required booking details." });
    }

    if (paymentMethod === "card") {
      if (!cardDetails) {
        return res.status(400).json({ success: false, message: "Card details are required." });
      }

      const { nameOnCard, cardNumber, expiryDate, cvv } = cardDetails;

      if (!nameOnCard || nameOnCard.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Invalid cardholder name." });
      }

      const digitsOnlyCard = cardNumber.replace(/\s+/g, "");
      if (!validateLuhn(digitsOnlyCard)) {
        return res.status(400).json({ success: false, message: "Invalid credit card number (Luhn check failed)." });
      }

      if (!validateExpiry(expiryDate)) {
        return res.status(400).json({ success: false, message: "Invalid or expired card expiry date (MM/YY)." });
      }

      if (!/^\d{3}$/.test(cvv)) {
        return res.status(400).json({ success: false, message: "CVV must be exactly 3 digits." });
      }

      if (cvv === "999" || digitsOnlyCard === "4000000000000000") {
        throw new Error("SIMULATED_PAYMENT_FAILURE");
      }
    }

    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Showtime not found." });
    }

    const unavailableSeats = [];
    const now = new Date();

    seats.forEach(seatCode => {
      const row = seatCode.charAt(0);
      const col = parseInt(seatCode.substring(1), 10);
      const seat = showtime.seats.find(s => s.row === row && s.col === col);

      if (!seat) {
        unavailableSeats.push(seatCode);
      } else if (seat.status === "occupied") {
        unavailableSeats.push(seatCode);
      } else if (seat.status === "locked" && seat.userId !== userId && seat.lockedUntil > now) {
        unavailableSeats.push(seatCode);
      }
    });

    if (unavailableSeats.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Seats no longer available: ${unavailableSeats.join(", ")}`,
        unavailableSeats
      });
    }

    seats.forEach(seatCode => {
      const row = seatCode.charAt(0);
      const col = parseInt(seatCode.substring(1), 10);
      const seat = showtime.seats.find(s => s.row === row && s.col === col);
      if (seat) {
        seat.status = "occupied";
        seat.userId = userId;
        seat.lockedUntil = null;
      }
    });

    await showtime.save({ session });

    const transactionId = "TXN-" + Math.floor(100000 + Math.random() * 900000);
    const newBooking = new Booking({
      userId,
      userEmail,
      showtimeId,
      seats,
      totalPrice,
      paymentStatus: "paid",
      transactionId
    });

    await newBooking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      data: newBooking
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.message === "SIMULATED_PAYMENT_FAILURE") {
      try {
        const { showtimeId, seats, userId } = req.body;
        if (showtimeId && seats && seats.length && userId) {
          const showtime = await Showtime.findById(showtimeId);
          if (showtime) {
            seats.forEach(seatCode => {
              const row = seatCode.charAt(0);
              const col = parseInt(seatCode.substring(1), 10);
              const seat = showtime.seats.find(s => s.row === row && s.col === col);
              if (seat && seat.status === "locked" && seat.userId === userId) {
                seat.status = "available";
                seat.userId = null;
                seat.lockedUntil = null;
              }
            });
            await showtime.save();
          }
        }
      } catch (err) {
        console.error("Failed to release seats on payment rollback:", err);
      }

      return res.status(402).json({
        success: false,
        message: "Payment transaction declined by gateway. Seats have been released."
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId query param is required." });
    }

    const bookings = await Booking.find({ userId, paymentStatus: "paid" })
      .populate({
        path: "showtimeId",
        populate: { path: "movieId" }
      })
      .sort({ bookingDate: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.paymentStatus === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled." });
    }

    const showtime = await Showtime.findById(booking.showtimeId).session(session);
    if (showtime) {
      booking.seats.forEach(seatCode => {
        const row = seatCode.charAt(0);
        const col = parseInt(seatCode.substring(1), 10);
        const seat = showtime.seats.find(s => s.row === row && s.col === col);
        if (seat && seat.userId === booking.userId) {
          seat.status = "available";
          seat.userId = null;
          seat.lockedUntil = null;
        }
      });
      await showtime.save({ session });
    }

    booking.paymentStatus = "cancelled";
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Booking cancelled and seats released successfully." });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};
