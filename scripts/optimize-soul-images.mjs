import sharp from 'sharp';
for (const name of ['portraits', 'hardware']) {
  await sharp(`assets/media/soul/${name}.png`).resize({ width: 1536 }).webp({ quality: 82 }).toFile(`src/media/soul/${name}.webp`);
}

await sharp('assets/media/soul/pure-soul.png').resize({ width: 1024 }).webp({ quality: 82 }).toFile('src/media/soul/pure-soul.webp');
