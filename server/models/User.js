import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },     // email
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "default.jpg" }, // NOT required now
    password: { type: String, required: true },
    role: { type: String, default: "user" }  // <= IMPORTANT
});

const User = mongoose.model("User", userSchema);
export default User;
