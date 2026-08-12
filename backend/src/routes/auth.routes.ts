import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema } from '../validators/user.validator.js';

const router = Router();

router.post('/register', validate(createUserSchema), registerUser);
router.post('/login', loginUser);
router.get('/me', getCurrentUser);

export default router;
