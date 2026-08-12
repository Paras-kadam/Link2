import { Router } from 'express';
import { getMessages } from '../controllers/message.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getMessages);

export default router;
