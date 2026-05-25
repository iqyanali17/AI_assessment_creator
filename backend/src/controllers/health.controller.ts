import { Request, Response } from 'express';
import mongoose from 'mongoose';
import redisClient from '@/lib/redis';
import { GeminiService } from '@/services/gemini.service';

export const getHealth = async (req: Request, res: Response): Promise<any> => {
  const services: any = {
    mongodb: 'disconnected',
    redis: 'disconnected',
    gemini: 'failed',
  };

  try {
    // 1. Check MongoDB
    if (mongoose.connection.readyState === 1) {
      services.mongodb = 'connected';
    }

    // 2. Check Redis
    try {
      const redisPing = await redisClient.ping();
      if (redisPing === 'PONG') {
        services.redis = 'connected';
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
      services.redis = 'error';
    }

    // 3. Check Gemini
    services.gemini = await GeminiService.checkHealth();

    // Determine overall success
    const isHealthy = 
      services.mongodb === 'connected' && 
      services.redis === 'connected' && 
      services.gemini === 'working';

    const statusCode = isHealthy ? 200 : 503;
    
    return res.status(statusCode).json({
      success: isHealthy,
      data: {
        status: isHealthy ? 'healthy' : 'degraded',
        services,
      },
    });
  } catch (error) {
    console.error('Health check controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error during health check',
      errors: {
        health: ['Unable to complete health check.'],
      },
    });
  }
};
