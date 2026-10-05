const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// If dist directory doesn't exist, build it
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('Dist not found, running build...');
  try {
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.error('Build execution failed:', err);
  }
}

// Serve static assets from dist with long-term immutable caching for hashed files
app.use(
  express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    index: false,
  })
);

// Fallback for client-side routing with no-cache on HTML so users always get the latest release
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Site is updating, please refresh in a moment.');
  }
});


const server = app.listen(PORT, () => {
  console.log(`🚀 Vaziro Frontend running on port ${PORT}`);
});

// Hostinger optimization: Close idle connections quickly to avoid process exhaustion
server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;

const gracefulShutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server and terminating frontend process gracefully`);

  // Hard exit fallback after 3 seconds so Hostinger never accumulates zombie processes
  const forceTimer = setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded, forcing process exit.');
    process.exit(0);
  }, 3000);
  forceTimer.unref();

  server.close(() => {
    console.log('Frontend HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

