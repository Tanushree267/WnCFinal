import express from "express";
import { getUserBookings } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post('/booking',getUserBookings)

export default userRouter;