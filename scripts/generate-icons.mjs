import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_IMAGE = join(process.cwd(), 'public', 'login-main-logo.png');
const OUTPUT_DIR = join(process.cwd(), 'public', 'icons');

async function generateIcons() {
  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // Generate icons for each size
    for (const size of SIZES) {
      const outputPath = join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFile(outputPath);
      
      console.log(`Generated ${size}x${size} icon`);
    }

    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 