import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { seasonStories } from "../src/data.js";

const API = "https://readwise.io/api/v3";
const SITE = process.env.MESSI_ARCHIVE_URL || "https://messi-career-vault.ukaushik37.workers.dev";
const RECEIPTS = new URL("../.reader-sync.json", import.meta.url);
const KEYCHAIN_SERVICE = "messi-archive-readwise-token";
const requestedSeason = process.argv.find((argument) => argument.startsWith("--season="))?.split("=").slice(1).join("=");
const force = process.argv.includes("--force");

function slug(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function tokenFromKeychain() {
  if (process.platform !== "darwin") return "";
  try {
    return execFileSync("security", ["find-generic-password", "-a", process.env.USER || "messi-archive", "-s", KEYCHAIN_SERVICE, "-w"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch { return ""; }
}

const token = process.env.READWISE_TOKEN || tokenFromKeychain();
if (!token) {
  console.log(`Reader sync queued: add READWISE_TOKEN or store it in macOS Keychain service “${KEYCHAIN_SERVICE}”.`);
  process.exit(0);
}

async function request(path, options = {}) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { Authorization: `Token ${token}`, "Content-Type": "application/json", ...options.headers },
    });
    if (response.status === 429 && attempt < 5) {
      const retryAfter = Math.max(1, Number(response.headers.get("retry-after")) || 10);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      continue;
    }
    if (!response.ok) throw new Error(`Reader ${options.method || "GET"} ${path} failed: ${response.status} ${await response.text()}`);
    return response.status === 204 ? null : response.json();
  }
}

function documentIsReady(document, story) {
  const wordCount = Number(document?.word_count ?? document?.wordCount ?? 0);
  const parsedBody = document?.html_content ?? document?.htmlContent ?? "";
  return Boolean(document && document.title?.includes(story.title) &&
    document.author === "The Messi Archive" && document.category === "article" &&
    ["new", "later", "shortlist"].includes(document.location) && wordCount > 0 && parsedBody.length > 200);
}

async function waitForParsedDocument(id, story) {
  let document;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const listed = await request(`/list/?id=${encodeURIComponent(id)}&withHtmlContent=true&limit=1`);
    document = listed.results?.[0];
    if (documentIsReady(document, story)) return document;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return document;
}

async function waitForDeployedArticle(canonical, story) {
  let status = 0;
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const response = await fetch(canonical);
    status = response.status;
    if (response.ok) {
      const html = await response.text();
      if (html.includes(`<title>${story.title}`)) return html;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Canonical URL did not expose chapter HTML after deployment: ${canonical} (last HTTP ${status})`);
}

let receipts = { documents: {} };
try { receipts = JSON.parse(await readFile(RECEIPTS, "utf8")); } catch {}

const entries = Object.entries(seasonStories).filter(([season]) => !requestedSeason || season === requestedSeason);
if (requestedSeason && entries.length === 0) throw new Error(`Unknown season: ${requestedSeason}`);

for (const [season, story] of entries) {
  const canonical = `${SITE}/articles/${season.replace("–", "-")}/${slug(story.title)}/`;
  const fingerprint = createHash("sha256").update(JSON.stringify(story)).digest("hex");
  const previous = receipts.documents[season];
  if (!force && previous?.fingerprint === fingerprint && previous?.verified) {
    console.log(`Reader unchanged: ${season} — ${story.title}`);
    continue;
  }

  const html = await waitForDeployedArticle(canonical, story);

  const saved = await request("/save/", {
    method: "POST",
    body: JSON.stringify({
      url: canonical, html, should_clean_html: true,
      title: `${story.title} — ${season}`, author: "The Messi Archive", summary: story.dek,
      image_url: story.photos?.[0]?.src, location: "new", category: "article",
      saved_using: "The Messi Archive Publisher",
      tags: ["messi-archive", "football", season.replace("–", "-")],
    }),
  });

  const document = await waitForParsedDocument(saved.id, story);
  const wordCount = Number(document?.word_count ?? document?.wordCount ?? 0);
  const parsedBody = document?.html_content ?? document?.htmlContent ?? "";
  const verified = documentIsReady(document, story);
  if (!verified) throw new Error(`Reader verification failed for ${season}: ${JSON.stringify({
    id: saved.id, title: document?.title, author: document?.author, category: document?.category,
    location: document?.location, wordCount, htmlLength: parsedBody.length,
  })}`);

  receipts.documents[season] = {
    id: saved.id, readerUrl: saved.url, canonical, fingerprint, verified: true, verifiedAt: new Date().toISOString(),
  };
  await writeFile(RECEIPTS, `${JSON.stringify(receipts, null, 2)}\n`);
  console.log(`Reader verified: ${season} — ${story.title} (${wordCount} words)`);
}
