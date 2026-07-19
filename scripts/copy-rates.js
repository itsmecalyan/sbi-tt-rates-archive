import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const srcRatesDir = path.join(rootDir, 'rates');
const destPublicRatesDir = path.join(rootDir, 'public', 'rates');

console.log('Syncing rates data...');

try {
  // Ensure destination parent directory exists
  fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });

  // Clean old destination if exists to keep it fresh
  if (fs.existsSync(destPublicRatesDir)) {
    fs.rmSync(destPublicRatesDir, { recursive: true, force: true });
  }

  // Copy directory recursively
  if (fs.existsSync(srcRatesDir)) {
    fs.cpSync(srcRatesDir, destPublicRatesDir, {
      recursive: true,
      filter: (src) => {
        // Exclude git metadata if any gets in there
        const basename = path.basename(src);
        return !basename.startsWith('.git');
      }
    });
    console.log(`Successfully copied rates data from "${srcRatesDir}" to "${destPublicRatesDir}"`);
  } else {
    console.warn(`Source rates directory not found at: ${srcRatesDir}`);
  }
} catch (error) {
  console.error('Failed to copy rates directory:', error);
  process.exit(1);
}
