import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Placeholders for future phases
// router.use('/users', userRoutes);
// router.use('/conversations', conversationRoutes);
// router.use('/messages', messageRoutes);
// router.use('/calls', callRoutes);
// router.use('/media', mediaRoutes);
// router.use('/notifications', notificationRoutes);

export default router;
