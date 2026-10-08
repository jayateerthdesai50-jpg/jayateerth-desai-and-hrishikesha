import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth.ts';
import playerRoutes from './routes/players.ts';
import facilityRoutes from './routes/facilities.ts';
import courtRoutes from './routes/courts.ts';
import bookingRoutes from './routes/bookings.ts';
import matchRoutes from './routes/matches.ts';
import performanceRoutes from './routes/performance.ts';
import notificationRoutes from './routes/notifications.ts';
import adminRoutes from './routes/admin.ts';
import coachingRoutes from './routes/coaching.ts';

export const backendApp = express();

backendApp.use(express.json());

// Request logging in development
backendApp.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      // quiet API request log
    });
  }
  next();
});

// API health check
backendApp.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'RallySphere API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
backendApp.use('/api/auth', authRoutes);
backendApp.use('/api/players', playerRoutes);
backendApp.use('/api/facilities', facilityRoutes);
backendApp.use('/api/courts', courtRoutes);
backendApp.use('/api/bookings', bookingRoutes);
backendApp.use('/api/matches', matchRoutes);
backendApp.use('/api/performance', performanceRoutes);
backendApp.use('/api/notifications', notificationRoutes);
backendApp.use('/api/admin', adminRoutes);
backendApp.use('/api/coaching', coachingRoutes);

// Centralized 404 for unknown /api routes
backendApp.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handling
backendApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled backend error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error in RallySphere Engine',
  });
});
