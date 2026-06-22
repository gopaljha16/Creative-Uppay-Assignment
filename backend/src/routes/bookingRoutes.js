const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookingsByUser);
router.post("/:id/cancel", bookingController.cancelBooking);

module.exports = router;
