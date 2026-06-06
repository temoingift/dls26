const fs = require('fs').promises;
const path = require('path');

async function copyDir(src, dest) {
  try {
    await fs.rm(dest, { recursive: true, force: true });
  } catch (e) {}
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

(async () => {
  const projectRoot = path.resolve(__dirname, '..');
  const src = path.join(projectRoot, 'dist', 'client');
  const destPublic = path.join(projectRoot, 'public');
  const destVercel = path.join(projectRoot, '.vercel', 'output', 'static');
  try {
    await copyDir(src, destPublic);
    console.log('Copied', src, '->', destPublic);
    await copyDir(src, destVercel);
    console.log('Copied', src, '->', destVercel);
  } catch (err) {
    console.error('Failed to copy client assets:', err);
    process.exit(1);
  }
})();
