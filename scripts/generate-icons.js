const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeB = Buffer.from(type)
  const crcVal = crc32(Buffer.concat([typeB, data]))
  const crcB = Buffer.alloc(4)
  crcB.writeUInt32BE(crcVal)
  return Buffer.concat([len, typeB, data, crcB])
}

function createPNG(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // build raw image data: filter byte + RGB per row
  const row = Buffer.alloc(1 + width * 3)
  row[0] = 0
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r
    row[2 + x * 3] = g
    row[3 + x * 3] = b
  }
  const rows = []
  for (let y = 0; y < height; y++) rows.push(row)
  const raw = Buffer.concat(rows)
  const compressed = zlib.deflateSync(raw, { level: 9 })

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

// Olive green #2D5A27 = RGB(45, 90, 39)
const R = 45, G = 90, B = 39

const sizes = [72, 96, 128, 192, 512]
sizes.forEach(size => {
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), createPNG(size, size, R, G, B))
  console.log(`✓ icon-${size}.png`)
})

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPNG(180, 180, R, G, B))
console.log('✓ apple-touch-icon.png')
console.log('Done — all icons created in public/icons/')
