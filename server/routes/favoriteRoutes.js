import express from "express";
import { addToFavorites, removeFromFavorites, getUserFavorites, checkFavorite } from "../controllers/favoriteController.js";

const favoriteRouter = express.Router();

favoriteRouter.post('/add', addToFavorites);
favoriteRouter.post('/remove', removeFromFavorites);
favoriteRouter.post('/user', getUserFavorites);
favoriteRouter.post('/check', checkFavorite);

export default favoriteRouter;