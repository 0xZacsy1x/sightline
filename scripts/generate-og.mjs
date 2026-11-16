// Generates public/og-image.png (1200×630) — the Open Graph / Twitter card referenced in layout.tsx.
// Run: pnpm og   (re-run whenever the tagline, logo geometry, or brand colours change)
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";

const ROOT = path.resolve(import.meta.dirname, "..");
// The `geist` package ships static TTFs next to the web fonts — the renderer needs TTF/OTF.
const FONTS = path.join(ROOT, "node_modules", "geist", "dist", "fonts");

const DARK = "#0B1220";
const LIGHT = "#FBFCFE";
const COBALT_LIGHT = "#4F7FE8"; // "then sign." accent (UI-REFERENCE.md §3.1)
const MUTED = "#8B95A8";
const LINE = "#2A3446";

// Split S, full-size cut (DESIGN.md §2.2).
const MARK = "M54 28H202V68H94V118H54Z M162 138H202V228H54V188H162Z";

const WIDTH = 1200;
const HEIGHT = 630;
const INSET = 40;

// Cobalt dot-grid masked with a 135° fade, as in the hero (UI-REFERENCE.md §1.4).
const DOT_GRID = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1.8" fill="${COBALT_LIGHT}"/>
      </pattern>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0.5" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0.9"/>
      </linearGradient>
      <mask id="mask"><rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)"/></mask>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dots)" mask="url(#mask)"/>
  </svg>`,
).toString("base64")}`;

/** A `+` corner mark centred on a frame corner (UI-REFERENCE.md §1.4). */
function corner(x, y) {
  return h(
    "div",
    {
      style: {
        position: "absolute",
        left: x - 12,
        top: y - 14,
        width: 24,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: DARK,
        color: LIGHT,
        fontFamily: "Geist Mono",
        fontSize: 24,
        lineHeight: 1,
      },
    },
    "+",
  );
}

const card = h(
  "div",
  {
    style: {
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      position: "relative",
      backgroundColor: DARK,
      color: LIGHT,
      fontFamily: "Geist",
    },
  },
  // Dot-grid, faded out towards the copy on the left (the only gradient the design allows).
  h("img", { src: DOT_GRID, width: WIDTH, height: HEIGHT, style: { position: "absolute", left: 0, top: 0 } }),
  // Ledger frame + corner marks.
  h("div", {
    style: {
      position: "absolute",
      left: INSET,
      top: INSET,
      width: WIDTH - INSET * 2,
      height: HEIGHT - INSET * 2,
      border: `1px solid ${LINE}`,
    },
  }),
  corner(INSET, INSET),
  corner(WIDTH - INSET, INSET),
  corner(INSET, HEIGHT - INSET),
  corner(WIDTH - INSET, HEIGHT - INSET),
  // Copy.
  h(
    "div",
    {
      style: {
        position: "absolute",
        left: 96,
        top: 0,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      },
    },
    h(
      "div",
      { style: { display: "flex", alignItems: "center" } },
      h(
        "svg",
        { width: 64, height: 64, viewBox: "0 0 256 256" },
        h("path", { d: MARK, fill: LIGHT, fillRule: "evenodd" }),
      ),
      h("div", { style: { marginLeft: 16, fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" } }, "Sightline"),
      h(
        "div",
        {
          style: {
            marginLeft: 24,
            padding: "6px 12px",
            border: `1px solid ${COBALT_LIGHT}`,
            color: COBALT_LIGHT,
            fontFamily: "Geist Mono",
            fontSize: 16,
            letterSpacing: "0.1em",
          },
        },
        "READ-ONLY",
      ),
    ),
    h(
      "div",
      {
        style: {
          marginTop: 44,
          display: "flex",
          flexDirection: "column",
          fontSize: 104,
          fontWeight: 500,
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
        },
      },
      h("div", null, "Check first,"),
      h("div", { style: { color: COBALT_LIGHT } }, "then sign."),
    ),
    h(
      "div",
      {
        style: {
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          fontFamily: "Geist Mono",
          fontSize: 22,
          letterSpacing: "0.1em",
          color: MUTED,
        },
      },
      h("div", { style: { width: 10, height: 10, marginRight: 16, backgroundColor: COBALT_LIGHT } }),
      "WEB3 SECURITY SCANNER · POWERED BY WEBACY",
    ),
  ),
);

async function main() {
  const font = async (file, name, weight) => ({
    name,
    weight,
    style: "normal",
    data: await readFile(path.join(FONTS, file)),
  });

  const image = new ImageResponse(card, {
    width: WIDTH,
    height: HEIGHT,
    fonts: await Promise.all([
      font("geist-sans/Geist-Medium.ttf", "Geist", 500),
      font("geist-sans/Geist-Bold.ttf", "Geist", 700),
      font("geist-mono/GeistMono-Regular.ttf", "Geist Mono", 400),
    ]),
  });

  const out = path.join(ROOT, "public", "og-image.png");
  await writeFile(out, Buffer.from(await image.arrayBuffer()));
  console.log(`✔ ${path.relative(ROOT, out)} written`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
