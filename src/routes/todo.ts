import { Router } from 'express';
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleTodoCompleted,
  todoValidation,
  idParamValidation
} from '../controllers/todo';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validator';

const router = Router();

// Apply authentication middleware to all todo routes
router.use(authenticate);

// Route definitions
router.post('/', validate(todoValidation), createTodo);
router.get('/', getTodos);
router.get('/:id', validate(idParamValidation), getTodoById);
router.put('/:id', validate([...idParamValidation, ...todoValidation]), updateTodo);
router.delete('/:id', validate(idParamValidation), deleteTodo);
router.patch('/:id/toggle', validate(idParamValidation), toggleTodoCompleted);

export default router; 