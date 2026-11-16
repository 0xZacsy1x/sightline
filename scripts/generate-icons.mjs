// Generates raster favicons / app icons from the Split S geometry in DESIGN.md §2.2.
// Run: npm run icons   (re-run whenever the logo geometry changes)
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve(import.meta.dirname, "..", "public");

const DARK = "#0B1220";
const LIGHT = "#FBFCFE";

// Full-size cut (≥32 px) and small-size cut (<32 px: 28 px gap, 44 px stroke).
const PATH_FULL = "M54 28H202V68H94V118H54Z M162 138H202V228H54V188H162Z";
const PATH_SMALL = "M54 28H202V72H98V114H54Z M158 142H202V228H54V184H158Z";

/**
 * Builds an SVG of the mark on a square canvas.
 * @param {object} o
 * @param {number} o.size     output px
 * @param {string} o.d        path data (256-unit space)
 * @param {string} o.fill     mark colour
 * @param {string} [o.bg]     background colour (omit = transparent)
 * @param {number} [o.scale]  mark scale relative to the 256 canvas (1 = as designed)
 */
function svg({ size, d, fill, bg, scale = 1 }) {
  const offset = (256 - 256 * scale) / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256">` +
      (bg ? `<rect width="256" height="256" fill="${bg}"/>` : "") +
      `<path transform="translate(${offset} ${offset}) scale(${scale})" d="${d}" fill="${fill}" fill-rule="evenodd"/>` +
      `</svg>`,
  );
}

const png = (input) => sharp(input).png().toBuffer();

/** Packs PNG buffers into a single .ico (PNG-in-ICO, supported by all modern browsers). */
function toIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  // favicon.ico — 16/32 use the small-size cut, 48 uses the full cut.
  const icoImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      data: await png(svg({ size, d: size < 32 ? PATH_SMALL : PATH_FULL, fill: DARK })),
    })),
  );
  await writeFile(path.join(PUBLIC, "favicon.ico"), toIco(icoImages));

  // App icons: reversed mark on dark tile (DESIGN.md "App icon" row).
  const appIcon = (size, scale) => png(svg({ size, d: PATH_FULL, fill: LIGHT, bg: DARK, scale }));
  await writeFile(path.join(PUBLIC, "apple-touch-icon.png"), await appIcon(180, 0.8));
  await writeFile(path.join(PUBLIC, "icon-192.png"), await appIcon(192, 0.8));
  await writeFile(path.join(PUBLIC, "icon-512.png"), await appIcon(512, 0.8));
  // Maskable: keep the mark inside the 80% safe-zone circle.
  await writeFile(path.join(PUBLIC, "maskable-512.png"), await appIcon(512, 0.6));

  console.log("✔ icons written to public/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
