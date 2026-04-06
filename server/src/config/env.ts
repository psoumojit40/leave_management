import dotenv from 'dotenv';
import path from 'path';

// This ensures it finds the .env file in the server root
dotenv.config();

export const config = {
  nodeEnv: String(process.env.NODE_ENV || 'development'),
  port: Number(process.env.PORT) || 5000,
  mongoURI: String(process.env.MONGODB_URI || ''),
  jwtSecret: String(process.env.JWT_SECRET || 'fallback_secret'),
  jwtExpiresIn: String(process.env.JWT_EXPIRES_IN || '1d'),
  email: {
    service: String(process.env.EMAIL_SERVICE || 'gmail'),
    user: String(process.env.EMAIL_USER || ''),
    pass: String(process.env.EMAIL_PASS || ''),
    from: String(process.env.EMAIL_FROM || ''),
  },
  corsOrigin: String(process.env.CORS_ORIGIN || 'http://localhost:3000'),
};

export default config;