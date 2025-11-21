// server/controllers/showControllers.js
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';

/**
 * Return movies for admin page (local DB)
 * GET /api/show/now-playing
 */
export const getNowPlayingMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    return res.json({ success: true, movies });
  } catch (err) {
    console.error('getNowPlayingMovies error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch movies' });
  }
};

/**
 * Return a single movie by id (local DB)
 * GET /api/show/movie/:id
 */
export const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    return res.json({ success: true, movie });
  } catch (err) {
    console.error('getMovieDetails error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch movie details' });
  }
};

/**
 * Return movie + shows for a given movie id (local DB)
 * GET /api/show/:id
 */
export const getShowDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const shows = await Show.find({ movie: movie._id }).sort({ showDateTime: 1 });

    return res.json({ success: true, movie, shows });
  } catch (err) {
    console.error('getShowDetails error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch show details' });
  }
};

/**
 * Add shows for a movie (admin)
 * POST /api/show/add
 * body: { movieId, showsInput: [{ date, time }], showPrice }
 */
export const addShows = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId) return res.status(400).json({ success: false, message: 'movieId is required' });
    if (!Array.isArray(showsInput) || showsInput.length === 0) {
      return res.status(400).json({ success: false, message: 'showsInput must be a non-empty array' });
    }

    const movieDoc = await Movie.findById(movieId);
    if (!movieDoc) return res.status(404).json({ success: false, message: 'Movie not found' });

    const createdShows = [];
    for (const s of showsInput) {
      if (!s.date || !s.time) continue;
      const showDateTime = new Date(`${s.date}T${s.time}:00`);
      const show = new Show({
        movie: movieDoc._id,
        showDateTime,
        showPrice: Number(showPrice) || 0,
        occupiedSeats: {},
      });
      await show.save();
      createdShows.push(show);
    }

    return res.json({ success: true, message: 'Shows added successfully', shows: createdShows });
  } catch (err) {
    console.error('addShows error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add shows' });
  }
};

/**
 * Public: get all upcoming shows populated with movie details
 * GET /api/show/all
 */
export const getAllUpcomingShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate('movie')
      .sort({ showDateTime: 1 });

    return res.json({ success: true, shows });
  } catch (err) {
    console.error('getAllUpcomingShows error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch shows' });
  }
};
