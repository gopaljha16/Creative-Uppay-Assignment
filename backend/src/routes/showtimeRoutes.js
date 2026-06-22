const express = require("express");
const router = express.Router();
const showtimeController = require("../controllers/showtimeController");

router.get("/", showtimeController.getShowtimesForMovie);
router.get("/:id", showtimeController.getShowtimeById);
router.post("/lock", showtimeController.lockSeats);
router.post("/release", showtimeController.releaseSeats);

module.exports = router;
