import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
    {
        user :{type: String , ref: 'User' , required : true},
        show :{type: String , ref: 'Show' , required : true},
        amount : {type: Number , required : true},
        bookedSeats : {type: Array , required : true},
        isPaid : {type: Boolean , default : false},
        paymentLink : {type: String},
        isCancelled: { type: Boolean, default: false },

    },{timestamps: true}
)

const Booking = mongoose.model('Booking' , showSchema);

export default Booking;
