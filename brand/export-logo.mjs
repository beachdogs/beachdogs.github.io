#!/usr/bin/env node
/**
 * Renders Beach Dog Marketing logo assets as transparent PNGs at 4× desktop size:
 *  - beach-dog-logo-mark.png          — coral waves mark only
 *  - beach-dog-marketing-logo.png     — full nav lockup (mark + wordmark)
 *
 * Run: node export-logo.mjs
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const chrome =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

if (!existsSync(chrome)) {
  console.error('Google Chrome not found. Set CHROME_PATH.')
  process.exit(1)
}

/** Magenta key — not used in the lockup. */
const KEY = { r: 255, g: 0, b: 255 }
/** Desktop .logo sizes × 4 (globals.css @min-width 1024px). */
const SCALE = 4
const MARK = 68 * SCALE
const ICON = 40 * SCALE
const GAP = 20 * SCALE
const FONT = 26 * SCALE
const PAD = 24 * SCALE

const WAVES = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 12q2.5 2 5 0t5 0 5 0 5 0" />
    <path d="M2 19q2.5 2 5 0t5 0 5 0 5 0" />
    <path d="M2 5q2.5 2 5 0t5 0 5 0 5 0" />
  </svg>
`

const sharedCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: rgb(${KEY.r}, ${KEY.g}, ${KEY.b});
    overflow: hidden;
    font-family: Mulish, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .logo-mark {
    display: grid;
    place-items: center;
    width: ${MARK}px;
    height: ${MARK}px;
    border-radius: 50%;
    background: #ff765d;
    color: #fff9ed;
    transform: rotate(-13deg);
    flex-shrink: 0;
  }
  .logo-mark svg {
    width: ${ICON}px;
    height: ${ICON}px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`

function buildHtml(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@800&display=swap" rel="stylesheet" />
  <style>
    ${sharedCss}
    #lockup {
      display: inline-flex;
      align-items: center;
      gap: ${GAP}px;
      padding: ${PAD}px;
      font-size: ${FONT}px;
      line-height: 0.95;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-transform: uppercase;
      color: #102832;
      white-space: nowrap;
    }
    #lockup i { color: #ff765d; font-style: normal; }
    #mark-only {
      display: inline-block;
      padding: ${PAD}px;
    }
  </style>
</head>
<body>
  ${body}
  <script>
    document.fonts.ready.then(function () {
      document.documentElement.setAttribute('data-ready', '1')
    })
  </script>
</body>
</html>`
}

const lockupHtml = buildHtml(`
  <div id="lockup">
    <span class="logo-mark">${WAVES}</span>
    <span>Beach Dog<br /><i>Marketing</i></span>
  </div>
`)

const markHtml = buildHtml(`
  <div id="mark-only">
    <span class="logo-mark">${WAVES}</span>
  </div>
`)

function capture(htmlPath, outPath, width, height) {
  const url = pathToFileURL(htmlPath).href
  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${width},${height}`,
      '--virtual-time-budget=15000',
      `--screenshot=${outPath}`,
      url,
    ],
    { encoding: 'utf8' },
  )
  if (result.status !== 0 || !existsSync(outPath)) {
    console.error(result.stderr || result.stdout)
    throw new Error(`Chrome screenshot failed for ${outPath}`)
  }
}

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1
  }
  return ~c >>> 0
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function decodePng(buf) {
  if (buf.toString('binary', 0, 8) !== '\u0089PNG\r\n\u001a\n') {
    throw new Error('Not a PNG')
  }
  let offset = 8
  let width = 0
  let height = 0
  let colorType = 0
  let bitDepth = 0
  const idats = []
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const data = buf.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
    } else if (type === 'IDAT') {
      idats.push(data)
    } else if (type === 'IEND') {
      break
    }
    offset += 12 + length
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`Unsupported PNG format: depth=${bitDepth} colorType=${colorType}`)
  }
  const raw = inflateSync(Buffer.concat(idats))
  const channels = colorType === 6 ? 4 : 3
  const stride = width * channels
  const rgba = Buffer.alloc(width * height * 4)
  let src = 0
  let dst = 0
  const prev = Buffer.alloc(stride)
  const row = Buffer.alloc(stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[src++]
    raw.copy(row, 0, src, src + stride)
    src += stride
    for (let i = 0; i < stride; i++) {
      const x = row[i]
      const a = i >= channels ? row[i - channels] : 0
      const b = prev[i]
      const c = i >= channels ? prev[i - channels] : 0
      let val = x
      if (filter === 1) val = (x + a) & 255
      else if (filter === 2) val = (x + b) & 255
      else if (filter === 3) val = (x + ((a + b) >> 1)) & 255
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        val = (x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter ${filter}`)
      }
      row[i] = val
    }
    for (let x = 0; x < width; x++) {
      const i = x * channels
      rgba[dst++] = row[i]
      rgba[dst++] = row[i + 1]
      rgba[dst++] = row[i + 2]
      rgba[dst++] = channels === 4 ? row[i + 3] : 255
    }
    row.copy(prev)
  }
  return { width, height, rgba }
}

function encodePng(width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1)
    raw[rowStart] = 0
    rgba.copy(raw, rowStart + 1, y * stride, y * stride + stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function trimAndKey(rgba, width, height) {
  const out = Buffer.from(rgba)
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = out[i]
      const g = out[i + 1]
      const b = out[i + 2]
      // Soft key for AA fringes against magenta
      const dr = Math.abs(r - KEY.r)
      const dg = Math.abs(g - KEY.g)
      const db = Math.abs(b - KEY.b)
      if (dr < 40 && dg < 40 && db < 40 && r > 200 && b > 200 && g < 80) {
        out[i + 3] = 0
        continue
      }
      if (out[i + 3] === 0) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  if (maxX < minX || maxY < minY) {
    throw new Error('Logo pixels not found — chroma key may have removed everything')
  }
  const pad = Math.round(8 * SCALE)
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)
  const tw = maxX - minX + 1
  const th = maxY - minY + 1
  const trimmed = Buffer.alloc(tw * th * 4)
  for (let y = 0; y < th; y++) {
    const src = ((minY + y) * width + minX) * 4
    out.copy(trimmed, y * tw * 4, src, src + tw * 4)
  }
  return { width: tw, height: th, rgba: trimmed }
}

function exportAsset({ name, html, width, height }) {
  const tmpHtml = join(__dirname, `_export-${name}.html`)
  const tmpShot = join(__dirname, `_export-${name}-raw.png`)
  const outPng = join(__dirname, `${name}.png`)
  writeFileSync(tmpHtml, html)
  capture(tmpHtml, tmpShot, width, height)
  const decoded = decodePng(readFileSync(tmpShot))
  const keyed = trimAndKey(decoded.rgba, decoded.width, decoded.height)
  writeFileSync(outPng, encodePng(keyed.width, keyed.height, keyed.rgba))
  for (const f of [tmpHtml, tmpShot]) {
    try {
      unlinkSync(f)
    } catch {}
  }
  const hash = createHash('sha1').update(readFileSync(outPng)).digest('hex').slice(0, 10)
  console.log(`Wrote ${outPng} (${keyed.width}×${keyed.height}, ${hash})`)
}

// Mark-only: room for the -13° rotation bbox
const markCanvas = MARK + PAD * 2 + Math.round(40 * SCALE)
exportAsset({
  name: 'beach-dog-logo-mark',
  html: markHtml,
  width: markCanvas,
  height: markCanvas,
})

// Full lockup: mark + wordmark
exportAsset({
  name: 'beach-dog-marketing-logo',
  html: lockupHtml,
  width: MARK + GAP + FONT * 10 + PAD * 2,
  height: MARK + PAD * 2 + Math.round(24 * SCALE),
})
