// server/controllers/adminController.js
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

/**
 * Simple isAdmin endpoint — you may enhance it later.
 * Assumes protectAdmin middleware already validated the user.
 */
export const isAdmin = async (req, res) => {
  try {
    // req.user can be set by protectAdmin middleware if used
    const adminFlag = !!(req.user && (req.user.role === "admin"));
    return res.json({ success: true, isAdmin: adminFlag });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Dashboard data: aggregate a few quick stats
 */
export const getDashBoardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie");
    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, b) => acc + (b.amount || 0), 0),
      activeShows,
      totalUser,
    };

    return res.json({ success: true, dashboardData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Return all shows from now onwards
 */
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });
    return res.json({ success: true, shows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Return all bookings for admin (with populated movie & show)
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate({
        path: "show",
        populate: { path: "movie" }
      })
      .sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
