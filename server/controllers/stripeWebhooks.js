import Stripe from 'stripe'
import Booking from '../models/Booking.js'
import Show from '../models/Show.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook Error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Only run logic when payment is confirmed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = session.metadata.bookingId

    const booking = await Booking.findById(bookingId)
    if (!booking) return res.json({ received: true })

    // Avoid double update if webhook fires twice
    if (!booking.isPaid) {
      booking.isPaid = true
      await booking.save()

      // Mark seats as occupied for that show
      const show = await Show.findById(booking.show)
      if (show) {
        if (!show.occupiedSeats) show.occupiedSeats = {}

        booking.bookedSeats.forEach(seat => {
          show.occupiedSeats.set(seat, true)
        })

        await show.save()
      }
    }
  }

  res.json({ received: true })
}