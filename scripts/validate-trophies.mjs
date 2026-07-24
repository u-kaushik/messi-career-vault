import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { honourLedger } from "../src/data.js";
import { honourAssetMap, honourVisualForHonour, recognitionAssetMap, recognitionAssets, trophyAssets } from "../src/trophyAssets.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const errors = [];
const hashes = new Map();

function readPng(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.toString("hex", 0, 8) !== "89504e470d0a1a0a") throw new Error("not a PNG");
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const bitDepth = bytes[24];
  const colorType = bytes[25];
  return { bytes, width, height, bitDepth, colorType };
}

for (const [id, asset] of Object.entries(trophyAssets)) {
  for (const field of ["src", "label", "source", "attribution", "license", "licenseUrl", "evidence"])
    if (!asset[field]) errors.push(`${id}: missing ${field}`);
  if (!asset.verified) errors.push(`${id}: not marked verified`);
  if (asset.display) {
    const allowed = new Set(["rotation"]);
    for (const field of Object.keys(asset.display))
      if (!allowed.has(field)) errors.push(`${id}: unknown display setting ${field}`);
    if (!Number.isFinite(asset.display.rotation) || Math.abs(asset.display.rotation) > 180)
      errors.push(`${id}: display rotation must be a finite angle from -180 to 180 degrees`);
  }
  if (!/^https:\/\//.test(asset.source) || !/^https:\/\//.test(asset.licenseUrl))
    errors.push(`${id}: source and licence must be HTTPS URLs`);

  const file = path.join(root, "public", asset.src.replace(/^\//, ""));
  if (!fs.existsSync(file)) {
    errors.push(`${id}: missing ${asset.src}`);
    continue;
  }
  try {
    const png = readPng(file);
    if (png.bitDepth !== 8 || png.colorType !== 6) errors.push(`${id}: expected 8-bit RGBA PNG`);
    const shortEdge = Math.min(png.width, png.height);
    const longEdge = Math.max(png.width, png.height);
    if (shortEdge < 200 || longEdge < 300) errors.push(`${id}: asset is too small (${png.width}×${png.height})`);
    const hash = crypto.createHash("sha256").update(png.bytes).digest("hex");
    if (hashes.has(hash)) errors.push(`${id}: duplicates ${hashes.get(hash)}`);
    hashes.set(hash, id);
  } catch (error) {
    errors.push(`${id}: ${error.message}`);
  }
}

const honours = [...new Set(Object.values(honourLedger).flatMap(({ team, individual }) => [...team, ...individual].map(([name]) => name)))];
for (const [name, id] of Object.entries(honourAssetMap)) {
  if (!honours.includes(name)) errors.push(`${name}: mapping does not match an honour`);
  if (!trophyAssets[id]) errors.push(`${name}: maps to unknown asset ${id}`);
}

for (const [id, asset] of Object.entries(recognitionAssets)) {
  for (const field of ["mark", "label", "source", "evidence"])
    if (!asset[field]) errors.push(`${id}: missing recognition ${field}`);
  if (asset.physical !== false || !asset.verified) errors.push(`${id}: recognition must be verified and explicitly non-physical`);
  if (!/^https:\/\//.test(asset.source)) errors.push(`${id}: recognition source must be HTTPS`);
}
for (const [name, id] of Object.entries(recognitionAssetMap)) {
  if (!honours.includes(name)) errors.push(`${name}: recognition mapping does not match an honour`);
  if (!recognitionAssets[id]) errors.push(`${name}: maps to unknown recognition ${id}`);
}

const pending = honours.filter((name) => !honourVisualForHonour(name));
if (strict && pending.length) {
  errors.push(`${pending.length} honours still need verified assets: ${pending.join("; ")}`);
}

if (errors.length) {
  console.error(`Trophy validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Trophy validation passed: ${Object.keys(trophyAssets).length} verified assets; ${pending.length} named honours pending.`);
