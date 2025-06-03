import dotenv from 'dotenv';
import { AppConfig } from '../types';

// Load environment variables from .env file
dotenv.config();

// Default configuration
const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'dev-client-name-aurora-srvless-instance-0.c7wwssaa0ugx.eu-west-3.rds.amazonaws.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'postgresdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your-srvless-strong-password-here',
  },
  redis: {
    host: process.env.REDIS_HOST || 'dev-client-name-valkey-srvless-bop3u1.serverless.euw3.cache.amazonaws.com',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || 'your-valkey-srvless-auth-token-here',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_do_not_use_in_production',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
  aws: {
    region: process.env.AWS_REGION || 'eu-west-3',
    secretName: process.env.AWS_SECRET_NAME || 'todo-service/secrets',
  },
};

export default config; 