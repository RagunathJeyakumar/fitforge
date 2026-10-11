const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Ensure public/icons directory exists
const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

/**
 * Generates a valid uncompressed/deflated RGBA PNG image buffer.
 */
function createPng(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    // CRC-32
    let crc = 0xffffffff;
    for (let i = 4; i < 8 + len; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte >>>= 1;
      }
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const ihdrChunk = makeChunk("IHDR", ihdr);

  const stride = width * 4;
  const rawData = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const color = drawFn(x, y, width, height);
      rawData[pxOffset] = color.r;
      rawData[pxOffset + 1] = color.g;
      rawData[pxOffset + 2] = color.b;
      rawData[pxOffset + 3] = color.a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * FitForge Icon Drawer:
 * Dark background #0A0D0F with subtle charcoal circular shield
 * Electric lime #D4FF00 barbell dumbbell & forge lightning bolt emblem.
 */
function drawFitForgeIcon(isMaskable) {
  return function (x, y, width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const scale = isMaskable ? 0.65 : 0.85; // Safe zone padding for maskables
    const normX = (x - cx) / (width * 0.5 * scale);
    const normY = (y - cy) / (height * 0.5 * scale);
    const dist = Math.sqrt(normX * normX + normY * normY);

    // Background color: #0A0D0F
    let r = 0x0a;
    let g = 0x0d;
    let b = 0x0f;
    let a = 0xff;

    // Outer subtle charcoal circle plate ring
    if (dist < 1.05 && dist > 0.88) {
      r = 0x1f;
      g = 0x24;
      b = 0x2b;
    }

    // Inner glow ring
    if (dist <= 0.88 && dist >= 0.82) {
      r = 0x3a;
      g = 0x48;
      b = 0x10;
    }

    // Barbell & Anvil/Lightning Forge Emblem
    // 1. Horizontal barbell bar
    const inBar = Math.abs(normY) <= 0.12 && Math.abs(normX) <= 0.72;

    // 2. Left weight plate pair
    const inLeftOuterPlate = Math.abs(normX - (-0.62)) <= 0.08 && Math.abs(normY) <= 0.52;
    const inLeftInnerPlate = Math.abs(normX - (-0.46)) <= 0.08 && Math.abs(normY) <= 0.42;

    // 3. Right weight plate pair
    const inRightOuterPlate = Math.abs(normX - 0.62) <= 0.08 && Math.abs(normY) <= 0.52;
    const inRightInnerPlate = Math.abs(normX - 0.46) <= 0.08 && Math.abs(normY) <= 0.42;

    // 4. Center Lightning / Forge Core (Angled polygon)
    // Triangle top and bottom lightning
    const inCenterBolt1 =
      normX >= -0.18 && normX <= 0.18 && normY >= -0.58 && normY <= 0.1 &&
      (normX * 1.5 + normY) <= 0.15 && (normX * 1.5 + normY) >= -0.65;
    const inCenterBolt2 =
      normX >= -0.15 && normX <= 0.22 && normY >= -0.05 && normY <= 0.58 &&
      (normX * 1.5 + normY) <= 0.65 && (normX * 1.5 + normY) >= -0.15;

    // Center power gem / diamond
    const diamondDist = Math.abs(normX) + Math.abs(normY);
    const inDiamond = diamondDist <= 0.28;

    if (inBar || inLeftOuterPlate || inLeftInnerPlate || inRightOuterPlate || inRightInnerPlate || inCenterBolt1 || inCenterBolt2 || inDiamond) {
      // Electric Lime #D4FF00
      r = 0xd4;
      g = 0xff;
      b = 0x00;
      a = 0xff;

      // Inner bevel / accent highlight
      if (Math.abs(normX) < 0.08 && Math.abs(normY) < 0.2) {
        r = 0xee;
        g = 0xff;
        b = 0x88;
      }
    }

    return { r, g, b, a };
  };
}

// Generate the icons
console.log("Generating FitForge PWA icons...");

const iconsToGenerate = [
  { file: "icon-192x192.png", size: 192, maskable: false },
  { file: "icon-512x512.png", size: 512, maskable: false },
  { file: "icon-maskable-192x192.png", size: 192, maskable: true },
  { file: "icon-maskable-512x512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, maskable: false },
  { file: "favicon-32x32.png", size: 32, maskable: false },
];

for (const icon of iconsToGenerate) {
  const filePath = path.join(iconsDir, icon.file);
  const buf = createPng(icon.size, icon.size, drawFitForgeIcon(icon.maskable));
  fs.writeFileSync(filePath, buf);
  console.log(`✓ Generated ${icon.file} (${icon.size}x${icon.size}, ${buf.length} bytes)`);
}

// Copy apple-touch-icon and favicon to public root
fs.copyFileSync(
  path.join(iconsDir, "apple-touch-icon.png"),
  path.join(__dirname, "..", "public", "apple-touch-icon.png")
);
fs.copyFileSync(
  path.join(iconsDir, "favicon-32x32.png"),
  path.join(__dirname, "..", "public", "favicon.png")
);

// Generate crisp SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E1217" />
      <stop offset="100%" stop-color="#050708" />
    </linearGradient>
    <linearGradient id="limeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4FF00" />
      <stop offset="100%" stop-color="#A6CC00" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#D4FF00" stroke-opacity="0.15" stroke-width="4" />

  <!-- Outer Gym Shield Plate -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="#1A2028" stroke-width="24" />
  <circle cx="256" cy="256" r="168" fill="none" stroke="#D4FF00" stroke-opacity="0.3" stroke-width="4" stroke-dasharray="16 8" />

  <!-- Dumbbell / Forge Emblem Group -->
  <g filter="url(#glow)">
    <!-- Central Barbell Shaft -->
    <rect x="110" y="240" width="292" height="32" rx="16" fill="url(#limeGrad)" />
    <rect x="110" y="248" width="292" height="8" rx="4" fill="#FFFFFF" opacity="0.4" />

    <!-- Left Plates -->
    <rect x="110" y="160" width="28" height="192" rx="12" fill="url(#limeGrad)" />
    <rect x="146" y="180" width="24" height="152" rx="10" fill="url(#limeGrad)" />
    <rect x="176" y="220" width="16" height="72" rx="6" fill="#88A800" />

    <!-- Right Plates -->
    <rect x="374" y="160" width="28" height="192" rx="12" fill="url(#limeGrad)" />
    <rect x="342" y="180" width="24" height="152" rx="10" fill="url(#limeGrad)" />
    <rect x="320" y="220" width="16" height="72" rx="6" fill="#88A800" />

    <!-- Center Forge Lightning Bolt -->
    <path d="M 272 136 L 220 252 L 264 252 L 240 376 L 304 240 L 260 240 Z" fill="url(#limeGrad)" stroke="#0E1217" stroke-width="6" stroke-linejoin="round" />
  </g>
</svg>
`;

fs.writeFileSync(path.join(iconsDir, "icon.svg"), svgContent.trim());
fs.writeFileSync(path.join(__dirname, "..", "public", "icon.svg"), svgContent.trim());
console.log("✓ Generated icon.svg in public/icons/ and public/");
console.log("All PWA icons ready!");
