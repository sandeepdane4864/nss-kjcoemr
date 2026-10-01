import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

for (const k of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[k]) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
}

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`NSS API running on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
