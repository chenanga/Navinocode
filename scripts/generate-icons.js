import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const sourceIcon = path.join(iconsDir, 'icon.png');
const sizes = [16, 32, 48, 128];

if (!fs.existsSync(sourceIcon)) {
  console.error(`Source icon is missing: ${sourceIcon}`);
  process.exit(1);
}

const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
if (probe.error || probe.status !== 0) {
  console.error('ffmpeg is required to generate extension icons.');
  process.exit(1);
}

for (const size of sizes) {
  const output = path.join(iconsDir, `icon-${size}.png`);
  const result = spawnSync('ffmpeg', [
    '-y',
    '-loglevel', 'error',
    '-i', sourceIcon,
    '-vf', `scale=${size}:${size}:flags=lanczos`,
    output,
  ], { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error(`Failed to generate ${size}x${size} icon.`);
    process.exit(1);
  }
  console.log(`Generated ${path.relative(process.cwd(), output)} (${size}x${size})`);
}
