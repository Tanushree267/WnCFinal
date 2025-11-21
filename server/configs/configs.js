// server/configs/config.js

// Read the key from the environment variable (loaded by dotenv)
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Read the frontend URL from the environment (or use a fallback)
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
