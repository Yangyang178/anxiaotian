const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crcInput = Buffer.concat([typeB, data]);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeB, data, crcB]);
}

function createIcon(size, drawFn) {
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0);
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawFn(x, y, size);
      raw.push(r, g, b, a);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const ihdr = createChunk('IHDR', ihdrData);
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

function drawHome(x, y, s, r, g, b) {
  const cx = s / 2;
  const bodyL = Math.round(s * 0.25), bodyR = Math.round(s * 0.75);
  const bodyT = Math.round(s * 0.45), bodyB = Math.round(s * 0.78);
  const roofT = Math.round(s * 0.18), roofB = bodyT;
  if (x >= bodyL && x <= bodyR && y >= bodyT && y <= bodyB) {
    const doorL = Math.round(cx - s * 0.06), doorR = Math.round(cx + s * 0.06);
    const doorT = Math.round(bodyB - s * 0.2);
    if (x >= doorL && x <= doorR && y >= doorT && y <= bodyB) return [0, 0, 0, 0];
    return [r, g, b, 255];
  }
  if (y >= roofT && y <= roofB) {
    const progress = (y - roofT) / (roofB - roofT);
    const halfW = (bodyR - bodyL) / 2 * progress;
    if (x >= cx - halfW && x <= cx + halfW) return [r, g, b, 255];
  }
  return [0, 0, 0, 0];
}

function drawCategory(x, y, s, r, g, b) {
  const gap = Math.round(s * 0.1);
  const sq = Math.round((s - gap * 3) / 2);
  const positions = [
    [gap, gap],
    [gap * 2 + sq, gap],
    [gap, gap * 2 + sq],
    [gap * 2 + sq, gap * 2 + sq]
  ];
  for (const [px, py] of positions) {
    if (x >= px && x <= px + sq && y >= py && y <= py + sq) return [r, g, b, 255];
  }
  return [0, 0, 0, 0];
}

function drawScan(x, y, s, r, g, b) {
  const m = Math.round(s * 0.18);
  const cl = Math.round(s * 0.18);
  const t = Math.round(s * 0.07);
  const corners = [
    [m, m, 1, 1],
    [s - m - cl, m, -1, 1],
    [m, s - m - cl, 1, -1],
    [s - m - cl, s - m - cl, -1, -1]
  ];
  for (const [cx, cy, dx, dy] of corners) {
    if (x >= cx && x <= cx + cl && y >= cy && y <= cy + t) return [r, g, b, 255];
    if (x >= cx && x <= cx + t && y >= cy && y <= cy + cl) return [r, g, b, 255];
  }
  const lineY = Math.round(s * 0.5);
  if (y >= lineY - t / 2 && y <= lineY + t / 2 && x >= m + cl && x <= s - m - cl) return [r, g, b, 255];
  return [0, 0, 0, 0];
}

function drawMine(x, y, s, r, g, b) {
  const cx = s / 2;
  const headR = s * 0.13;
  const headCy = s * 0.3;
  if (Math.sqrt((x - cx) ** 2 + (y - headCy) ** 2) <= headR) return [r, g, b, 255];
  const bodyR = s * 0.26;
  const bodyCy = s * 0.88;
  if (Math.sqrt((x - cx) ** 2 + (y - bodyCy) ** 2) <= bodyR && y <= s * 0.62) return [r, g, b, 255];
  return [0, 0, 0, 0];
}

const dir = path.join(__dirname, 'images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const gray = [153, 153, 153];
const green = [82, 196, 26];

const icons = [
  { name: 'home', fn: drawHome, color: gray },
  { name: 'home-active', fn: drawHome, color: green },
  { name: 'category', fn: drawCategory, color: gray },
  { name: 'category-active', fn: drawCategory, color: green },
  { name: 'scan', fn: drawScan, color: gray },
  { name: 'scan-active', fn: drawScan, color: green },
  { name: 'mine', fn: drawMine, color: gray },
  { name: 'mine-active', fn: drawMine, color: green },
];

icons.forEach(({ name, fn, color: [cr, cg, cb] }) => {
  const png = createIcon(81, (x, y, s) => fn(x, y, s, cr, cg, cb));
  fs.writeFileSync(path.join(dir, `${name}.png`), png);
});

console.log('Icons generated successfully!');
