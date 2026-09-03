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

// Serve static assets from dist
app.use(express.static(distPath));

// Fallback for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Site is building, please refresh in a moment.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Vaziro Frontend running on port ${PORT}`);
});
