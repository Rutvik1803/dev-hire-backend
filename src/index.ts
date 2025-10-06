import express, { Express, Request, Response } from 'express';
import config from './config';
import authRoutes from './modules/auth/auth.route';
import { errorHandler } from './middlewares/errorHandler';

const app: Express = express();
const PORT: number = Number(config.PORT);

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Global error handler middleware could be added here
app.use(errorHandler);

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log('Server started on port', PORT);
  /* eslint-enable no-console */
});
