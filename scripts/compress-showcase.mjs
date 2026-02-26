import sharp from "sharp";
import { readdir } from "fs/promises";
import { join } from "path";

const INPUT_DIR = "C:/Users/SaurabhThakur/OneDrive - Unison Mining/Desktop/PNGIMAGES";
const OUTPUT_DIR = "C:/webdevpersonal/textoverlay/public/showcase";
const MAX_WIDTH = 800;
const QUALITY = 80;

const files = (await readdir(INPUT_DIR)).filter((f) => f.endsWith(".png"));

console.log(`Found ${files.length} images. Compressing...`);

for (let i = 0; i < files.length; i++) {
  const input = join(INPUT_DIR, files[i]);
  const output = join(OUTPUT_DIR, `${i + 1}.webp`);

  const info = await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);

  console.log(
    `  ${files[i]} -> ${i + 1}.webp (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB)`
  );
}

console.log("Done!");
