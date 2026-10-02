
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';

let dbConnectionPromise;

async function ensureDBConnection() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB()
      .catch((err) => {
        dbConnectionPromise = null;
        throw err;
      });
  }

  await dbConnectionPromise;

  console.log(
    'MongoDB readyState:',
    mongoose.connection.readyState
  );
}

// Vercel serverless handler
export default async function handler(req, res) {
  console.log('Handler invoked:', req.method, req.url);

  try {
    await ensureDBConnection();
    return app(req, res);
  } catch (err) {
    console.error('Backend initialization failed:', err);

    return res.status(500).json({
      message: 'Server initialization failed',
    });
  }
}

// Local development
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;

  ensureDBConnection()
    .then(() => {
      app.listen(port, () => {
        console.log(`NSS API running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start:', err.message);
      process.exit(1);
    });
}