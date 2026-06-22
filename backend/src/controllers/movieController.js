const Movie = require("../models/movie");

exports.getMovies = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const movies = await Movie.find(query);
    res.status(200).json({ success: true, count: movies.length, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }
    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
