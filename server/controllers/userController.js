//API controller Function to Get User Bookings

import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import axios from 'axios';

export const getUserBookings = async (req , res)=>
{
    try
    {
        const { userId } = req.body; // Assuming userId is sent in the request body

        const bookings = await Booking.find({
  user: userId,
  isCancelled: false
})
  .populate({ path: 'show', populate: { path: 'movie' } })
  .sort({ createdAt: -1 })




        res.json({success:true , bookings})
    }
    catch(error)
    {
        console.error(error.message);
        res.json({success:false,message:error.message});
}
}