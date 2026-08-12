import { Router } from 'express';
import { uploadFile, downloadFile, getMediaVault, deleteFile } from '../controllers/file.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/upload', requireAuth, upload.single('file'), uploadFile);
router.get('/vault', requireAuth, getMediaVault);
router.get('/:id', requireAuth, downloadFile);
router.delete('/:id', requireAuth, deleteFile);

export default router;
