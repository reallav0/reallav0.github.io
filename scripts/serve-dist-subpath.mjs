import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve("dist");
const prefix = "/portfolio/";
const port = 4180;
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? prefix, "http://localhost").pathname;
  if (!pathname.startsWith(prefix)) {
    response.writeHead(404).end("Not found");
    return;
  }

  const relativePath = decodeURIComponent(pathname.slice(prefix.length)) || "index.html";
  const candidate = resolve(root, relativePath);
  if (!candidate.startsWith(root + sep) || !existsSync(candidate) || !statSync(candidate).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": types[extname(candidate)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(candidate).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Static subpath preview: http://127.0.0.1:${port}${prefix}`);
});
