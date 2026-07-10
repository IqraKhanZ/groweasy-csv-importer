import rateLimit from 'express-rate-limit';

// =============================================================================
// Rate limiter for the import endpoint
// =============================================================================

export const importRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // max 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});
