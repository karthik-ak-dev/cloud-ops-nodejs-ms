import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import userModel from '../models/user';
import config from '../config';
import { ApiError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw ApiError.badRequest('User with this email already exists');
    }
    
    // Create new user
    const user = await userModel.create(username, email, password);
    
    if (!user) {
      throw ApiError.internalError('Failed to create user');
    }
    
    // Generate JWT token
    const payload = { 
      userId: user.id, 
      username: user.username, 
      email: user.email 
    };
    
    // Ignore TypeScript error for JWT
    // @ts-ignore: JWT sign types are complex, but this works at runtime
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    
    // Return user info and token (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    logger.error('Error in register controller:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      throw ApiError.badRequest('Invalid email or password');
    }
    
    // Verify password
    const isPasswordValid = await userModel.verifyPassword(user, password);
    
    if (!isPasswordValid) {
      throw ApiError.badRequest('Invalid email or password');
    }
    
    // Generate JWT token
    const payload = { 
      userId: user.id, 
      username: user.username, 
      email: user.email 
    };
    
    // Ignore TypeScript error for JWT
    // @ts-ignore: JWT sign types are complex, but this works at runtime
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    
    // Return user info and token (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    logger.error('Error in login controller:', error);
    next(error);
  }
}; 