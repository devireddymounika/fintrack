// Vercel Serverless Function entry point.
// Vercel requires serverless functions to live in the /api directory.
// This file simply re-exports the Express app from the server module.
import app from '../server/src/index.js';

export default app;
