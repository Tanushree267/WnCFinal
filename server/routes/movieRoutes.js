// server/routes/movieRoutes.js
import express from 'express';
import {
  createMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
  getMovieById,
  searchMovies,
} from '../controllers/movieController.js';

import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Static & admin routes FIRST
router.get('/', getAllMovies);                     // public list
router.get('/search', searchMovies);               // search
router.get('/admin', protectAdmin, getAllMovies);  // admin list (protected)
router.get('/admin/:id', protectAdmin, getMovieById); // admin movie details (protected)
router.post('/admin', protectAdmin, createMovie);  // create movie
router.put('/admin/:id', protectAdmin, updateMovie);
router.delete('/admin/:id', protectAdmin, deleteMovie);

// Param route LAST (so it doesn't shadow others)
router.get('/:id', getMovieById); // Public route for movie details

export default router;



