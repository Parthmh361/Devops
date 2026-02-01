import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth.routes';
import examplesRoutes from './routes/examples.routes';
import eventRoutes from './routes/event.routes';
import proposalRoutes from './routes/proposal.routes';
import collaborationRoutes from './routes/collaboration.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/examples', examplesRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Event Sponsorship & Collaboration Platform API',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      path: req.path,
    },
  });
});

export default app;
