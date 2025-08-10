const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'public', 'workers');
const targetDir = path.join(__dirname, '..', 'dist', 'workers');

try {
  if (fs.existsSync(sourceDir)) {
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    console.log('Workers copied successfully');
  } else {
    console.log('Source workers directory not found');
  }
} catch (error) {
  console.error('Error copying workers:', error);
  process.exit(1);
}