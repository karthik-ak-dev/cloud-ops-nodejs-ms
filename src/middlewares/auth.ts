import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config';
import { AuthRequest, DecodedToken } from '../types';
import logger from '../utils/logger';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'Authentication token missing' });
      return;
    }
    
    // Ignore TypeScript error for JWT
    // @ts-ignore: JWT verify types are complex, but this works at runtime
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    // In a real app, you would check for admin role in the user object
    // This is a simplified example
    if (req.user.username === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  } catch (error) {
    logger.error('Authorization error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 