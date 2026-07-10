import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { importRateLimiter } from '../middleware/rateLimiter';
import { previewImport, processImport } from '../controllers/importController';

const router = Router();

/**
 * POST /api/import/preview
 * Accepts a CSV file and returns parsed rows + headers (no AI call).
 */
router.post('/preview', upload.single('file'), previewImport);

/**
 * POST /api/import/process
 * Rate-limited. Accepts a CSV file (or pre-parsed JSON rows) and runs the
 * full AI extraction pipeline, returning an ImportResult.
 */
router.post('/process', importRateLimiter, upload.single('file'), processImport);

export default router;
