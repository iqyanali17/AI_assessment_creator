declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: 'development' | 'test' | 'production';
      MONGODB_URI?: string;
      REDIS_URL?: string;
      GEMINI_API_KEY?: string;
      GEMINI_MODEL?: string;
      GEMINI_FALLBACK_MODELS?: string;
      UPLOAD_DIR?: string;
      NEXT_PUBLIC_APP_URL?: string;
    }
  }
}

export {};
