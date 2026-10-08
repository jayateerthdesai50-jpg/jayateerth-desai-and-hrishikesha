import express from 'express';
import path from 'path';
import { backendApp } from './backend/app.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Mount API routes
app.use(backendApp);

// Serve static frontend assets from dist in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// For all other requests, serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏸 RallySphere server listening on http://0.0.0.0:${PORT}`);
});
