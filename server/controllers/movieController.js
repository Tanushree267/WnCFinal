import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';

// Helper: normalize genres (string → array)
const normalizeGenres = (genres) => {
  if (!genres) return [];
  if (Array.isArray(genres)) return genres;
  // if it's a string: "Action, Drama"
  return genres
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
};

// @desc    Create a new movie (admin)
// @route   POST /api/movie/admin
// @access  Admin
export const createMovie = async (req, res) => {
  try {
    const {
      title,
      overview,
      poster_path,
      backdrop_path,
      release_date,
      original_language,
      tagline,
      genres,
      vote_average,
      runtime,
      trailer_url } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const genresArray = normalizeGenres(genres);

    // If your Movie schema uses _id: String, generate a string id
    const movieId = Date.now().toString();

    const movie = new Movie({
      _id: movieId,
      title,
      overview,
      poster_path,
      backdrop_path,
      release_date,
      original_language,
      tagline,
      genres: genresArray,
      vote_average: vote_average || 0,
      runtime: runtime || 0,
      trailer_url: trailer_url || '',
    });

    await movie.save();

    return res.json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
  } catch (error) {
    console.error('createMovie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create movie',
    });
  }
};

// @desc    Get all movies (for admin AddShows page)
// @route   GET /api/movie/admin
// @access  Admin
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      movies,
    });
  } catch (error) {
    console.error('getAllMovies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch movies',
    });
  }
};

// @desc    Update a movie (edit wrong details)
// @route   PUT /api/movie/admin/:id
// @access  Admin
export const updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const {
      title,
      overview,
      poster_path,
      backdrop_path,
      release_date,
      original_language,
      tagline,
      genres,
      vote_average,
      runtime,
    } = req.body;

    if (title !== undefined) movie.title = title;
    if (overview !== undefined) movie.overview = overview;
    if (poster_path !== undefined) movie.poster_path = poster_path;
    if (backdrop_path !== undefined) movie.backdrop_path = backdrop_path;
    if (release_date !== undefined) movie.release_date = release_date;
    if (original_language !== undefined) movie.original_language = original_language;
    if (tagline !== undefined) movie.tagline = tagline;
    if (genres !== undefined) movie.genres = normalizeGenres(genres);
    if (vote_average !== undefined) movie.vote_average = vote_average;
    if (runtime !== undefined) movie.runtime = runtime;

    await movie.save();

    return res.json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    console.error('updateMovie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update movie',
    });
  }
};

// @desc    Delete a movie (cancel wrong movie)
// @route   DELETE /api/movie/admin/:id
// @access  Admin
export const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Find all shows for this movie
    const shows = await Show.find({ movie: movieId });

    // Get all show IDs
    const showIds = shows.map(show => show._id);

    // Delete all bookings for these shows
    if (showIds.length > 0) {
      await Booking.deleteMany({ show: { $in: showIds } });
    }

    // Delete all shows for this movie
    await Show.deleteMany({ movie: movieId });

    // Finally, delete the movie
    await Movie.findByIdAndDelete(movieId);

    return res.json({
      success: true,
      message: 'Movie and all related shows and bookings deleted successfully',
    });
  } catch (error) {
    console.error('deleteMovie error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
    });
  }
};

// @desc    Get a movie by ID (public)
// @route   GET /api/movie/:id
// @access  Public
export const getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Fetch shows for this movie
    const shows = await Show.find({ movie: movieId }).sort({ showDateTime: 1 });

    return res.json({
      success: true,
      movie,
      shows,
    });
  } catch (error) {
    console.error('getMovieById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch movie',
    });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    console.log('Search query:', q);
    if (!q) return res.json({ success: true, movies: [] });

    const regex = new RegExp(q, 'i');
    console.log('Regex:', regex);
    // Search by title or genres (genres is an array of strings)
    const movies = await Movie.find({
      $or: [
        { title: { $regex: regex } },
        { genres: { $elemMatch: { $regex: regex } } }
      ]
    }).sort({ createdAt: -1 });

    console.log('Movies found:', movies.length);
    return res.json({ success: true, movies });
  } catch (err) {
    console.error('searchMovies error:', err);
    return res.status(500).json({ success: false, message: 'Search failed' });
}
};