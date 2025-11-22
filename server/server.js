import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config(); // Load variables from .env into process.env
import connectDB from './configs/db.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import favoriteRouter from './routes/favoriteRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import Stripe from 'stripe';

const app = express();
const port = 3000;

await connectDB();

// Simple debug route you can open in browser
app.get('/api/stripe/test', (req, res) => {
  console.log('🔥 GET /api/stripe/test HIT');
  res.send('stripe test ok');
});

//Stripe webhooks route
app.post('/api/stripe',express.raw({type : 'application/json'}),stripeWebhooks)
// // This MUST come before bodyParser.json for that route
app.post(
  '/api/booking/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
)

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Server is Live'));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/movie', movieRoutes);
app.use('/api/favorite', favoriteRouter);

/* ---------------------- REGISTER ---------------------- */

app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            _id: email,
            name,
            email,
            password: hashedPassword,
            image: "default.jpg",
            role: "user"
        });

        await newUser.save();
        res.json({ message: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ---------------------- LOGIN ---------------------- */
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: "Invalid credentials" });

        // TOKEN = user._id (email) - simple auth
        const token = user._id;

        res.json({
            message: "Login successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`)
);