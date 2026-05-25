import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  GEMINI_FALLBACK_MODELS: z.string().default('gemini-2.5-flash-lite,gemini-2.0-flash'),
  UPLOAD_DIR: z.string().default('uploads'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
