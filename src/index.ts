import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import config from './config';
import authRoutes from './modules/auth/auth.route';
import { errorHandler } from './middlewares/errorHandler';

const app: Express = express();
const PORT: number = Number(config.PORT);

// Add cors headers
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Adjust as needed
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Global error handler middleware could be added here
app.use(errorHandler);

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log('Server started on port', PORT);
  /* eslint-enable no-console */
});
