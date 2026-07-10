import express from 'express';
import cors from 'cors';
import importRoutes from './routes/importRoutes';
import { errorHandler } from './middleware/errorHandler';

// =============================================================================
// Express application
// =============================================================================

const app = express();

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const corsOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:3000';

app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ---------------------------------------------------------------------------
// Body parser
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '50mb' }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/import', importRoutes);

// ---------------------------------------------------------------------------
// Error handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorHandler);

export default app;
