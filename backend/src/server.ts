import 'dotenv/config';
import http from 'http';
import app from './app';
import { logger } from './utils/logger';

// =============================================================================
// HTTP Server bootstrap
// =============================================================================

const PORT = parseInt(process.env['PORT'] ?? '4000', 10);

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`GrowEasy backend is listening on port ${PORT}`);
  logger.info(`Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
  logger.info(`AI Provider: ${process.env['AI_PROVIDER'] ?? 'openai'}`);
  logger.info(`CORS Origin: ${process.env['CORS_ORIGIN'] ?? 'http://localhost:3000'}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Exiting.`);
  } else {
    logger.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});
