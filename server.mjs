import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const dist = join(root, "dist");
const dataDir = join(root, "data");
const storePath = join(dataDir, "progress.json");
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

await mkdir(dataDir, { recursive: true });
async function loadStore() {
  try {
    return JSON.parse(await readFile(storePath, "utf8"));
  } catch {
    return {};
  }
}
async function saveStore(value) {
  await writeFile(storePath, JSON.stringify(value, null, 2));
}
function json(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(value));
}
function validId(id) {
  return /^[a-zA-Z0-9-]{12,80}$/.test(id);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const match = url.pathname.match(/^\/api\/progress\/([^/]+)$/);
    if (match) {
      const id = decodeURIComponent(match[1]);
      if (!validId(id)) return json(res, 400, { error: "Invalid profile ID" });
      const store = await loadStore();
      if (req.method === "GET")
        return json(res, 200, store[id] || { watch: {}, seen: {} });
      if (req.method === "PUT") {
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 100000) throw new Error("Payload too large");
        }
        const value = JSON.parse(body || "{}");
        store[id] = {
          watch: value.watch || {},
          seen: value.seen || {},
          updatedAt: new Date().toISOString(),
        };
        await saveStore(store);
        return json(res, 200, { ok: true });
      }
      return json(res, 405, { error: "Method not allowed" });
    }
    let file = normalize(
      join(dist, url.pathname === "/" ? "index.html" : url.pathname),
    );
    if (!file.startsWith(dist)) return json(res, 403, { error: "Forbidden" });
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    } catch {
      file = join(dist, "index.html");
    }
    const content = await readFile(file);
    res.writeHead(200, {
      "content-type": mime[extname(file)] || "application/octet-stream",
    });
    res.end(content);
  } catch (error) {
    json(res, 500, { error: error.message || "Server error" });
  }
});
server.listen(port, "0.0.0.0", () =>
  console.log(`Messi Career Vault: http://localhost:${port}`),
);
