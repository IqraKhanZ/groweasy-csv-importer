import multer from 'multer';
import { FileTooLargeError } from '../types/crmRecord';

// =============================================================================
// Constants
// =============================================================================

const ALLOWED_MIME_TYPES = ['text/csv', 'application/vnd.ms-excel'];
const DEFAULT_MAX_FILE_SIZE_MB = 10;

// =============================================================================
// Multer configuration
// =============================================================================

const maxFileSizeMb = parseInt(process.env['MAX_FILE_SIZE_MB'] ?? '', 10);
const maxFileSize =
  (isNaN(maxFileSizeMb) || maxFileSizeMb <= 0
    ? DEFAULT_MAX_FILE_SIZE_MB
    : maxFileSizeMb) *
  1024 *
  1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new FileTooLargeError(
          'Invalid file type. Only CSV files are allowed.',
          'INVALID_FILE_TYPE',
        ),
      );
    }
  },
});
