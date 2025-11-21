import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Stripe from 'stripe';

const checkSeatsAvailability = async (showId , selectedSeats ) => {
  // implement real check: check Show.occupiedSeats and ensure none of selectedSeats are present
  const show = await Show.findById(showId)
  if (!show) return false
  const occupied = Object.keys(show.occupiedSeats || {})
  for (const seat of selectedSeats) {
    if (occupied.includes(seat)) return false
  }
  return true
}

export const createBooking = async (req , res) => {
  try {
    const { userId, showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Basic validation
    if (!userId || !showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing parameters' })
    }

    // Check seat availability
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats)
    if (!isAvailable) {
      return res.json({ success: false, message: "Selected Seats are not available." })
    }

    // Get show details
    const showData = await Show.findById(showId).populate('movie')
    if (!showData) return res.status(404).json({ success: false, message: 'Show not found' })

    // compute amount (example: show price + seat prices). Here replace with your real price calc
    const seatRate = 100 // or derive from show/row
    const amountRupees = (selectedSeats.length * seatRate) + (showData.showPrice || 0)
    const amountPaisa = Math.round(amountRupees * 100)

    // Create booking (unpaid)
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: amountRupees,
      bookedSeats: selectedSeats,
      isPaid: false
    })

    // Initialize stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const line_items = [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: showData.movie.title || 'Movie Booking'
          },
          unit_amount: amountPaisa
        },
        quantity: 1
      }
    ]

    const session = await stripe.checkout.sessions.create({
  success_url: `${origin}/loading/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/my-bookings`,
  line_items,
  mode: 'payment',
  metadata: {
    bookingId: booking._id.toString()
  },
  expires_at: Math.floor(Date.now() / 1000) + 30 * 60 // 30 minutes from now
})

    // store payment link/sessionId if you want
    booking.paymentSessionId = session.id
    await booking.save()

    res.json({ success: true, url: session.url })
  } catch (error) {
    console.error('createBooking error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId)

    if (!showData) {
      return res.json({ success: true, occupiedSeats: [] })
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {})
    res.json({ success: true, occupiedSeats })
  } catch (error) {
    console.log('Error in getOccupiedSeats:', error.message);
    res.status(500).json({ success: false, message: error.message })
  }
}
