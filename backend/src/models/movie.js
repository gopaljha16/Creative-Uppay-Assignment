const mongoose = require("mongoose");

const castSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  imageUrl: { type: String, required: true }
});

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  posterUrl: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  duration: { type: String, required: true },
  rating: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  cast: [castSchema],
  formats: [{ type: String, enum: ["2D", "3D", "IMAX"], default: "2D" }],
  status: { type: String, enum: ["now-showing", "coming-soon"], default: "now-showing" }
}, {
  timestamps: true
});

module.exports = mongoose.model("Movie", movieSchema);
