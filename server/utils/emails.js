// server/utils/emails.js
import nodemailer from 'nodemailer';

export const sendBookingEmail = async (user, booking, show) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const seatList = booking.bookedSeats.join(', ');
  const dateTime = new Date(show.showDateTime).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const mailOptions = {
    from: `WnC Cinema <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `Your booking is confirmed – ${show.movie?.title || 'Movie'}`,
    html: `
      <h2>Booking Confirmed ✅</h2>
      <p>Hi ${user.name || ''},</p>
      <p>Your ticket has been booked successfully.</p>
      <ul>
        <li><strong>Movie:</strong> ${show.movie?.title || ''}</li>
        <li><strong>Date & Time:</strong> ${dateTime}</li>
        <li><strong>Seats:</strong> ${seatList}</li>
        <li><strong>Amount Paid:</strong> ₹${booking.amount}</li>
      </ul>
      <p>Enjoy your show! 🍿</p>
    `,
  };

  console.log('📧 Sending email to:', user.email);
  await transporter.sendMail(mailOptions);
  console.log('✅ Email sent successfully to:', user.email);
};