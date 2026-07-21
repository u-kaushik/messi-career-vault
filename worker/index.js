const json = (value, status = 200, headers = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...headers,
    },
  });

const bytesToHex = (bytes) =>
  [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const hexToBytes = (hex) =>
  new Uint8Array(hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
const randomHex = (length = 32) =>
  bytesToHex(crypto.getRandomValues(new Uint8Array(length)));
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return bytesToHex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: hexToBytes(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
const cookieToken = (request) =>
  request.headers.get("cookie")?.match(/(?:^|; )messi_session=([^;]+)/)?.[1];
async function currentUser(request, env) {
  const token = cookieToken(request);
  if (!token) return null;
  return env.DB.prepare(
    "SELECT users.id, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ? AND sessions.expires_at > ?",
  )
    .bind(token, Date.now())
    .first();
}
async function readBody(request) {
  if (Number(request.headers.get("content-length") || 0) > 100000)
    throw new Error("Payload too large");
  return request.json();
}
const sessionCookie = (token, maxAge = 60 * 60 * 24 * 30) =>
  `messi_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/articles/") && !url.pathname.includes(".")) {
      url.pathname = `${url.pathname.replace(/\/$/, "")}.html`;
      return env.ASSETS.fetch(new Request(url, request));
    }
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      if (url.pathname === "/api/auth/me" && request.method === "GET") {
        const user = await currentUser(request, env);
        return user ? json({ user }) : json({ error: "Not signed in" }, 401);
      }
      if (url.pathname === "/api/auth/logout" && request.method === "POST") {
        const token = cookieToken(request);
        if (token)
          await env.DB.prepare("DELETE FROM sessions WHERE token = ?")
            .bind(token)
            .run();
        return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
      }
      if (
        ["/api/auth/login", "/api/auth/register"].includes(url.pathname) &&
        request.method === "POST"
      ) {
        const body = await readBody(request);
        const email = String(body.email || "")
          .trim()
          .toLowerCase();
        const password = String(body.password || "");
        if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
          return json(
            { error: "Use a valid email and at least 8 password characters" },
            400,
          );
        let user;
        if (url.pathname.endsWith("register")) {
          const salt = randomHex(16);
          const hash = await passwordHash(password, salt);
          try {
            const result = await env.DB.prepare(
              "INSERT INTO users (email, password_hash, salt, created_at) VALUES (?, ?, ?, ?)",
            )
              .bind(email, hash, salt, Date.now())
              .run();
            user = { id: result.meta.last_row_id, email };
          } catch {
            return json(
              { error: "An account with that email already exists" },
              409,
            );
          }
        } else {
          const record = await env.DB.prepare(
            "SELECT id, email, password_hash, salt FROM users WHERE email = ?",
          )
            .bind(email)
            .first();
          if (
            !record ||
            !crypto.subtle.timingSafeEqual(
              hexToBytes(await passwordHash(password, record.salt)),
              hexToBytes(record.password_hash),
            )
          )
            return json({ error: "Incorrect email or password" }, 401);
          user = { id: record.id, email: record.email };
        }
        const token = randomHex();
        await env.DB.prepare(
          "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        )
          .bind(token, user.id, Date.now() + 30 * 86400000)
          .run();
        return json({ user }, 200, { "set-cookie": sessionCookie(token) });
      }
      if (url.pathname === "/api/progress") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Not signed in" }, 401);
        if (request.method === "GET") {
          const row = await env.DB.prepare(
            "SELECT watch, seen FROM progress WHERE user_id = ?",
          )
            .bind(user.id)
            .first();
          return json(
            row
              ? { watch: JSON.parse(row.watch), seen: JSON.parse(row.seen) }
              : { watch: {}, seen: {} },
          );
        }
        if (request.method === "PUT") {
          const body = await readBody(request);
          await env.DB.prepare(
            "INSERT INTO progress (user_id, watch, seen, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET watch=excluded.watch, seen=excluded.seen, updated_at=excluded.updated_at",
          )
            .bind(
              user.id,
              JSON.stringify(body.watch || {}),
              JSON.stringify(body.seen || {}),
              Date.now(),
            )
            .run();
          return json({ ok: true });
        }
      }
      return json({ error: "Not found" }, 404);
    } catch (error) {
      return json({ error: error.message || "Server error" }, 500);
    }
  },
};
