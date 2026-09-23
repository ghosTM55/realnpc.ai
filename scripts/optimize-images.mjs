import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const output = new URL("src/media/", root);
await mkdir(output, { recursive: true });
for (const [name, original] of [
  ["hero", "hero-freeze-test.jpg"],
  ["assembly", "three-layers-parts-wall.jpg"],
]) {
  const source = fileURLToPath(new URL(`assets/media/${original}`, root));
  for (const width of [1280, 1920, 2880]) {
    const file = fileURLToPath(new URL(`${name}-${width}.webp`, output));
    const result = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(file);
    console.log(`${name}-${width}.webp: ${result.size} bytes`);
  }
  if (name === "hero") {
    const result = await sharp(source).resize(900, 1600, { fit: "cover", position: "centre" }).webp({ quality: 82, effort: 6 }).toFile(fileURLToPath(new URL("hero-portrait.webp", output)));
    console.log(`hero-portrait.webp: ${result.size} bytes`);
  }
}
