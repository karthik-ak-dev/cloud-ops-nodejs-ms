import { Router } from 'express';
import { register, login, registerValidation, loginValidation } from '../controllers/auth';
import { validate } from '../middlewares/validator';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

export default router; 