// server/controllers/adminController.js
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import nodemailer from 'nodemailer'

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
 * Return all shows from now onwards with totalBookings and totalRevenue
 */
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // Aggregate totalBookings and totalRevenue for each show
    const showStats = await Booking.aggregate([
      {
        $match: { isPaid: true }
      },
      {
        $group: {
          _id: "$show",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    // Create a map for quick lookup
    const statsMap = {};
    showStats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        totalBookings: stat.totalBookings,
        totalRevenue: stat.totalRevenue
      };
    });

    // Attach stats to shows
    const showsWithStats = shows.map(show => ({
      ...show.toObject(),
      totalBookings: statsMap[show._id.toString()]?.totalBookings || 0,
      totalRevenue: statsMap[show._id.toString()]?.totalRevenue || 0
    }));

    return res.json({ success: true, shows: showsWithStats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Return all bookings for admin (with populated movie, show, and user)
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate({
        path: "show",
        populate: { path: "movie" }
      })
      .populate("user")
      .sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// util to send email
const sendBookingEmail = async (user, booking, show) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',               // or use "smtp" config of some free provider
    auth: {
      user: process.env.SMTP_USER,  // your email
      pass: process.env.SMTP_PASS   // app password
    }
  })

  const seatList = booking.bookedSeats.join(', ')

  const mailOptions = {
    from: `"Watch & Chill" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Your booking for ${show.movie.title} is confirmed`,
    html: `
      <h2>Booking Confirmed ✅</h2>
      <p>Hi ${user.name || ''},</p>
      <p>Your ticket has been booked successfully.</p>
      <ul>
        <li><strong>Movie:</strong> ${show.movie.title}</li>
        <li><strong>Date & Time:</strong> ${new Date(show.showDateTime).toLocaleString()}</li>
        <li><strong>Seats:</strong> ${seatList}</li>
        <li><strong>Amount Paid:</strong> ₹${booking.amount}</li>
      </ul>
      <p>Enjoy your show! 🍿</p>
    `
  }

  await transporter.sendMail(mailOptions)
}

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const bookingId = session.metadata?.bookingId
    if (!bookingId) {
      console.error('No bookingId in session metadata')
      return res.json({ received: true })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      console.error('Booking not found in webhook')
      return res.json({ received: true })
    }

    // If we already processed, skip
    if (!booking.isPaid) {
      booking.isPaid = true
      await booking.save()

      // Mark seats as occupied for that show
      const show = await Show.findById(booking.show).populate('movie')
      if (show) {
        if (!show.occupiedSeats) show.occupiedSeats = {}

        booking.bookedSeats.forEach(seat => {
          show.occupiedSeats[seat] = true
        })
        await show.save()
console.log("🔥 Stripe payment confirmed for booking:", bookingId)
console.log("Seats booked:", booking.bookedSeats)
        // Fetch user to send mail
        const user = await User.findById(booking.user)
        if (user?.email) {
          try {
            await sendBookingEmail(user, booking, show)
          } catch (mailErr) {
            console.error('Error sending booking email:', mailErr.message)
          }
        }
      }
    }
  }

  res.json({ received: true })
}