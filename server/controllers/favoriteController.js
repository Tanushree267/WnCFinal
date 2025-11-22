import Favorite from '../models/Favorite.js';
import Movie from '../models/Movie.js';

export const addToFavorites = async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        if (!userId || !movieId) {
            return res.json({ success: false, message: "User ID and Movie ID are required" });
        }

        // Check if already exists
        const existing = await Favorite.findOne({ userId, movieId });
        if (existing) {
            return res.json({ success: false, message: "Movie already in favorites" });
        }

        const favorite = new Favorite({ userId, movieId });
        await favorite.save();

        res.json({ success: true, message: "Added to favorites" });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const removeFromFavorites = async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        if (!userId || !movieId) {
            return res.json({ success: false, message: "User ID and Movie ID are required" });
        }

        await Favorite.findOneAndDelete({ userId, movieId });

        res.json({ success: true, message: "Removed from favorites" });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getUserFavorites = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "User ID is required" });
        }

        const favorites = await Favorite.find({ userId });
        const movieIds = favorites.map(fav => fav.movieId);

        // Get movie details
        const movies = await Movie.find({ _id: { $in: movieIds } });

        res.json({ success: true, movies });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const checkFavorite = async (req, res) => {
    try {
        const { userId, movieId } = req.body;

        if (!userId || !movieId) {
            return res.json({ success: false, message: "User ID and Movie ID are required" });
        }

        const favorite = await Favorite.findOne({ userId, movieId });
        const isFavorite = !!favorite;

        res.json({ success: true, isFavorite });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};