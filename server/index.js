import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dist配信
app.use(express.static(path.join(__dirname, "../client/dist")));

// Simple server-side proxy for external API endpoints.
// This helps when the browser blocks cross-origin JSONP/script resources (eg. net::ERR_BLOCKED_BY_ORB).
// Very basic safety checks are included to avoid proxying local/private addresses.
app.get("/api/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: "missing url" });
  try {
    const turl = new URL(target);
    const host = turl.hostname;
    // Reject obvious private/loopback hosts
    if (
      host === "localhost" ||
      host === "::1" ||
      host === "127.0.0.1" ||
      /^10\.|^127\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return res.status(400).json({ error: "disallowed host" });
    }

    const fetched = await fetch(target);
    const text = await fetched.text();
    const ct = fetched.headers.get("content-type") || "";

    // If it's JSON, forward parsed JSON
    if (ct.includes("json")) {
      try {
        return res.json(JSON.parse(text));
      } catch (e) {}
    }

    // Try to unwrap JSONP: look for the first '(' and last ')' and parse the contents
    const m = text.match(/\(\s*([\s\S]*)\s*\)\s*;?\s*$/);
    if (m && m[1]) {
      try {
        return res.json(JSON.parse(m[1]));
      } catch (e) {}
    }

    // Fallback: return raw text inside a JSON envelope
    return res.json({ raw: text });
  } catch (err) {
    console.warn("proxy error", err);
    res.status(500).json({ error: "proxy_error", message: String(err) });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
