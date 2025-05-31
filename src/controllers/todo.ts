import { Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import todoModel from '../models/todo';
import { AuthRequest } from '../types';
import { ApiError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export const todoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim(),
];

export const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
];

export const createTodo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    const { title, description } = req.body;
    const userId = req.user.userId;
    
    const todo = await todoModel.create(userId, title, description);
    
    if (!todo) {
      throw ApiError.internalError('Failed to create todo');
    }
    
    res.status(201).json({
      message: 'Todo created successfully',
      todo,
    });
  } catch (error) {
    logger.error('Error in createTodo controller:', error);
    next(error);
  }
};

export const getTodos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    const userId = req.user.userId;
    const todos = await todoModel.findByUserId(userId);
    
    res.status(200).json({
      message: 'Todos retrieved successfully',
      todos,
    });
  } catch (error) {
    logger.error('Error in getTodos controller:', error);
    next(error);
  }
};

export const getTodoById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    const todoId = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    
    const todo = await todoModel.findById(todoId);
    
    if (!todo) {
      throw ApiError.notFound('Todo not found');
    }
    
    // Check if the todo belongs to the authenticated user
    if (todo.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to access this todo');
    }
    
    res.status(200).json({
      message: 'Todo retrieved successfully',
      todo,
    });
  } catch (error) {
    logger.error('Error in getTodoById controller:', error);
    next(error);
  }
};

export const updateTodo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    const todoId = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { title, description, completed } = req.body;
    
    // Check if todo exists and belongs to user
    const existingTodo = await todoModel.findById(todoId);
    
    if (!existingTodo) {
      throw ApiError.notFound('Todo not found');
    }
    
    if (existingTodo.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to update this todo');
    }
    
    // Update todo
    const updatedTodo = await todoModel.update(todoId, userId, {
      title,
      description,
      completed,
    });
    
    if (!updatedTodo) {
      throw ApiError.internalError('Failed to update todo');
    }
    
    res.status(200).json({
      message: 'Todo updated successfully',
      todo: updatedTodo,
    });
  } catch (error) {
    logger.error('Error in updateTodo controller:', error);
    next(error);
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    const todoId = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    
    // Check if todo exists and belongs to user
    const existingTodo = await todoModel.findById(todoId);
    
    if (!existingTodo) {
      throw ApiError.notFound('Todo not found');
    }
    
    if (existingTodo.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this todo');
    }
    
    // Delete todo
    const deleted = await todoModel.delete(todoId, userId);
    
    if (!deleted) {
      throw ApiError.internalError('Failed to delete todo');
    }
    
    res.status(200).json({
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    logger.error('Error in deleteTodo controller:', error);
    next(error);
  }
};

export const toggleTodoCompleted = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    const todoId = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    
    // Check if todo exists and belongs to user
    const existingTodo = await todoModel.findById(todoId);
    
    if (!existingTodo) {
      throw ApiError.notFound('Todo not found');
    }
    
    if (existingTodo.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to update this todo');
    }
    
    // Toggle completed status
    const updatedTodo = await todoModel.toggleCompleted(todoId, userId);
    
    if (!updatedTodo) {
      throw ApiError.internalError('Failed to update todo');
    }
    
    res.status(200).json({
      message: 'Todo status toggled successfully',
      todo: updatedTodo,
    });
  } catch (error) {
    logger.error('Error in toggleTodoCompleted controller:', error);
    next(error);
  }
}; 