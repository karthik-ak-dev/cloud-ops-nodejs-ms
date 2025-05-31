import { Router } from 'express';
import authRoutes from './auth';
import todoRoutes from './todo';

const router = Router();

router.use('/auth', authRoutes);
router.use('/todos', todoRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running',
    timestamp: new Date().toISOString(),
  });
});

export default router; 