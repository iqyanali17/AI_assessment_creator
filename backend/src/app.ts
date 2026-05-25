import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.route';
import generateRoutes from './routes/generate.route';
import assignmentRoutes from './routes/assignment.route';
import uploadRoutes from './routes/upload.route';
import jobRoutes from './routes/job.route';
import { rateLimiter, securityHeaders } from './middleware/security.middleware';

const app: Application = express();

// Middleware
app.use(cors());
app.use(securityHeaders);
app.use(rateLimiter);
app.use(express.json({ limit: '1mb' }));

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON body.',
      errors: {
        body: ['Request body must be valid JSON. Check for missing commas, quotes, or brackets.'],
      },
    });
  }

  return next(error);
});

// Routes
app.use('/health', healthRoutes);
app.use('/generate', generateRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/uploads', uploadRoutes);
app.use('/jobs', jobRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Assessment Creator API is running',
    data: {
      service: 'AI Assessment Creator API',
      version: '0.1.0',
    },
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: 'Route not found.',
    errors: {
      path: [`No API route found for ${req.method} ${req.originalUrl}.`],
    },
  });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API error:', error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    errors: {
      server: ['An unexpected error occurred. Please try again.'],
    },
  });
});

export default app;
