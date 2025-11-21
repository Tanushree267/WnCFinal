// server/routes/showRoutes.js
import express from 'express';
import {
  getNowPlayingMovies,
  getMovieDetails,
  getShowDetails,
  addShows,
  getAllUpcomingShows
} from '../controllers/showControllers.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing', getNowPlayingMovies);      // admin page list (DB)
showRouter.get('/movie/:id', getMovieDetails);            // movie details (DB)
showRouter.get('/all', getAllUpcomingShows);              // public: all upcoming shows
showRouter.get('/:id', getShowDetails);                   // movie + shows (DB) - keep last so it doesn't shadow /all

// protect add shows
showRouter.post('/add', protectAdmin, addShows);

export default showRouter;



