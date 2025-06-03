import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { updateConfigWithSecrets } from './services/secretsManager';
import Database from './services/database';
import CacheService from './services/cache';
import routes from './routes';
import config from './config';
import { errorHandler, notFound } from './middlewares/errorHandler';
import logger from './utils/logger';

const app = express();

// Initialize database and cache services
const db = Database.getInstance();
const cache = CacheService.getInstance();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint (before API routes)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (without /api prefix)
app.use('/', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Load secrets from AWS Secrets Manager
    await updateConfigWithSecrets();
    
    // Initialize database (create tables if they don't exist)
    await db.initialize();
    
    // Connect to Redis
    await cache.connect();
    
    // Start Express server
    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server started in ${config.nodeEnv} mode on port ${config.port}`);
      logger.info(`Health check available at: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await cache.disconnect();
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await cache.disconnect();
  await db.close();
  process.exit(0);
});

// Start the server
startServer(); 