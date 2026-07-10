import { Router } from 'express';
import multer from 'multer';
import { importCsv } from '../controllers/import.controller';

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/', upload.single('file'), importCsv);

export default router;
