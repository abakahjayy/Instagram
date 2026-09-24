// Generates the installable-app icons in public/icons (no image libraries needed):
// Instagram-style camera glyph on the signature gradient.
//
//   node scripts/generate-icons.mjs
//
// - icon-192.png / icon-512.png: rounded-square icons (manifest "any")
// - maskable-512.png: full-bleed background with the glyph inside Android's safe zone
// - apple-touch-icon.png (180): iOS home screen (iOS rounds the corners itself)
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});
const crc32 = (buf) => {
	let c = 0xffffffff;
	for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length);
	const td = Buffer.concat([Buffer.from(type), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(td));
	return Buffer.concat([len, td, crc]);
};
const encodePng = (size, rgba) => {
	const raw = Buffer.alloc((size * 4 + 1) * size);
	for (let y = 0; y < size; y++) {
		raw[y * (size * 4 + 1)] = 0; // filter: none
		rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
	}
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(size, 0);
	ihdr.writeUInt32BE(size, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // RGBA
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk("IHDR", ihdr),
		chunk("IDAT", deflateSync(raw, { level: 9 })),
		chunk("IEND", Buffer.alloc(0)),
	]);
};

// Gradient stops along the bottom-left -> top-right diagonal.
const STOPS = [
	[0, [254, 218, 117]],
	[0.25, [250, 126, 30]],
	[0.5, [214, 41, 118]],
	[0.75, [150, 47, 191]],
	[1, [79, 91, 213]],
];
const gradient = (t) => {
	for (let i = 1; i < STOPS.length; i++) {
		if (t <= STOPS[i][0]) {
			const [t0, c0] = STOPS[i - 1];
			const [t1, c1] = STOPS[i];
			const k = (t - t0) / (t1 - t0);
			return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
		}
	}
	return STOPS.at(-1)[1];
};

// Signed distance to a rounded rectangle centred at (cx, cy).
const sdRoundRect = (x, y, cx, cy, hw, hh, r) => {
	const qx = Math.abs(x - cx) - (hw - r);
	const qy = Math.abs(y - cy) - (hh - r);
	return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
const coverage = (d) => Math.min(Math.max(0.5 - d, 0), 1); // 1px anti-aliasing

function drawIcon(size, { rounded, glyphScale }) {
	const px = Buffer.alloc(size * size * 4);
	const c = size / 2;
	const g = (size / 2) * glyphScale; // glyph half-size
	const stroke = g * 0.17;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const fx = x + 0.5;
			const fy = y + 0.5;
			const bgAlpha = rounded ? coverage(sdRoundRect(fx, fy, c, c, c, c, size * 0.225)) : 1;
			const [r, gg, b] = gradient(((fx / size) + (1 - fy / size)) / 2);
			// white glyph: rounded-square outline, lens ring, flash dot
			const frame = Math.abs(sdRoundRect(fx, fy, c, c, g, g, g * 0.5)) - stroke / 2;
			const lens = Math.abs(Math.hypot(fx - c, fy - c) - g * 0.42) - stroke / 2;
			const dot = Math.hypot(fx - (c + g * 0.52), fy - (c - g * 0.52)) - g * 0.11;
			const white = Math.max(coverage(frame), coverage(lens), coverage(dot));
			const i = (y * size + x) * 4;
			px[i] = Math.round(r + (255 - r) * white);
			px[i + 1] = Math.round(gg + (255 - gg) * white);
			px[i + 2] = Math.round(b + (255 - b) * white);
			px[i + 3] = Math.round(255 * bgAlpha);
		}
	}
	return encodePng(size, px);
}

const out = new URL("../public/icons/", import.meta.url);
mkdirSync(out, { recursive: true });
const files = {
	"icon-192.png": drawIcon(192, { rounded: true, glyphScale: 0.62 }),
	"icon-512.png": drawIcon(512, { rounded: true, glyphScale: 0.62 }),
	"maskable-512.png": drawIcon(512, { rounded: false, glyphScale: 0.5 }), // inside the 80% safe zone
	"apple-touch-icon.png": drawIcon(180, { rounded: false, glyphScale: 0.6 }),
};
for (const [name, png] of Object.entries(files)) {
	writeFileSync(new URL(name, out), png);
	console.log(`public/icons/${name}  ${png.length} bytes`);
}
