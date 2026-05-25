import { NextFunction, Request, Response } from 'express';

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 120;

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return next();
};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  current.count += 1;

  if (current.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests.',
      errors: {
        rateLimit: [`Maximum ${MAX_REQUESTS} requests per minute exceeded. Please try again shortly.`],
      },
    });
  }

  return next();
};
