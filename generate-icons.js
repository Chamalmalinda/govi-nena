const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#2E7D32';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Leaf shape
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;
  ctx.moveTo(cx, cy - r);
  ctx.bezierCurveTo(cx + r, cy - r, cx + r, cy + r, cx, cy + r);
  ctx.bezierCurveTo(cx - r, cy + r, cx - r, cy - r, cx, cy - r);
  ctx.fill();

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', filename), buffer);
  console.log(`✅ ${filename} generated!`);
}

generateIcon(192, 'icon-192.png');
generateIcon(512, 'icon-512.png');