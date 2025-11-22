// server/controllers/stripeWebhooks.js
import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import { sendBookingEmail } from '../utils/emails.js';  // 👈 fixed path

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`); // 👈 fixed
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const bookingId = session.metadata?.bookingId;
    console.log('🔔 checkout.session.completed for bookingId:', bookingId);

    if (!bookingId) {
      console.error('No bookingId in session metadata');
      return res.json({ received: true });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found for ID:', bookingId);
      return res.json({ received: true });
    }

    // Mark booking as paid
    booking.isPaid = true;
    await booking.save();
    console.log('💰 Booking marked as paid:', booking._id);

    // Mark seats as occupied on the Show
    const show = await Show.findById(booking.show).populate('movie');
    if (show) {
      if (!show.occupiedSeats) show.occupiedSeats = {};

      booking.bookedSeats.forEach((seat) => {
        show.occupiedSeats.set(seat, true);
      });

      await show.save();
      console.log('🎫 Seats marked occupied for show:', show._id);
    }

    // Fetch user and send email
    const user = await User.findById(booking.user);

    if (user?.email) {
      // 👉 THIS is where your console block goes:
      console.log('➡ Reached sendBookingEmail for booking:', booking._id);

      try {
        await sendBookingEmail(user, booking, show);
        console.log('✅ Booking email sent to:', user.email);
      } catch (mailErr) {
        console.error('❌ Error sending booking email:', mailErr);
      }
    } else {
      console.error('User not found or no email for booking:', booking._id);
    }
  }

  res.json({ received: true });
};