// server/routes/adminRoutes.js
import express from "express";
import {
  isAdmin,
  getDashBoardData,
  getAllShows,
  getAllBookings
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/auth.js"; // if you have this
const router = express.Router();

router.get("/is-admin", protectAdmin, isAdmin);
router.get("/dashboard", protectAdmin, getDashBoardData);
router.get("/shows", protectAdmin, getAllShows);
router.get("/bookings", protectAdmin, getAllBookings);

export default router;

