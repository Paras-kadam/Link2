import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser, logoutUser, getCurrentUser } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginUserSchema } from '../validators/user.validator.js';

const router = Router();

// Stricter rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 login requests per window
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validate(loginUserSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', requireAuth, getCurrentUser);

export default router;
