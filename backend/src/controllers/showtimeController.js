const Showtime = require("../models/showtime");

const releaseExpiredLocks = async (showtime) => {
  let changed = false;
  const now = new Date();

  showtime.seats.forEach(seat => {
    if (seat.status === "locked" && seat.lockedUntil && seat.lockedUntil < now) {
      seat.status = "available";
      seat.userId = null;
      seat.lockedUntil = null;
      changed = true;
    }
  });

  if (changed) {
    await showtime.save();
  }
  return showtime;
};

exports.getShowtimesForMovie = async (req, res) => {
  try {
    const { movieId, date } = req.query;
    if (!movieId || !date) {
      return res.status(400).json({ success: false, message: "movieId and date are required" });
    }

    const showtimes = await Showtime.find({ movieId, date });
    
    for (let showtime of showtimes) {
      await releaseExpiredLocks(showtime);
    }

    res.status(200).json({ success: true, count: showtimes.length, data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShowtimeById = async (req, res) => {
  try {
    let showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Showtime not found" });
    }

    showtime = await releaseExpiredLocks(showtime);
    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.lockSeats = async (req, res) => {
  try {
    const { showtimeId, seats, userId } = req.body;
    if (!showtimeId || !seats || !seats.length || !userId) {
      return res.status(400).json({ success: false, message: "showtimeId, seats, and userId are required" });
    }

    let showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Showtime not found" });
    }

    showtime = await releaseExpiredLocks(showtime);

    const now = new Date();
    const lockedUntil = new Date(Date.now() + 5 * 60 * 1000);

    const unavailableSeats = [];
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
        seat.status = "locked";
        seat.userId = userId;
        seat.lockedUntil = lockedUntil;
      }
    });

    await showtime.save();

    res.status(200).json({
      success: true,
      message: "Seats locked successfully",
      lockedUntil
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.releaseSeats = async (req, res) => {
  try {
    const { showtimeId, seats, userId } = req.body;
    if (!showtimeId || !seats || !seats.length || !userId) {
      return res.status(400).json({ success: false, message: "showtimeId, seats, and userId are required" });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Showtime not found" });
    }

    let changed = false;
    seats.forEach(seatCode => {
      const row = seatCode.charAt(0);
      const col = parseInt(seatCode.substring(1), 10);
      const seat = showtime.seats.find(s => s.row === row && s.col === col);
      
      if (seat && seat.status === "locked" && seat.userId === userId) {
        seat.status = "available";
        seat.userId = null;
        seat.lockedUntil = null;
        changed = true;
      }
    });

    if (changed) {
      await showtime.save();
    }

    res.status(200).json({ success: true, message: "Seats released successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
