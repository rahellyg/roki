const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 5000;
const root = path.join(__dirname);

const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const reqPath = req.url === "/" ? "index.html" : req.url.replace(/^\//, "").replace(/\.\./g, "");
  let file = path.join(root, reqPath);
  file = path.resolve(file);
  if (!file.startsWith(root)) file = path.join(root, "index.html");
  fs.readFile(file, (err, data) => {
    if (err) {
      if (!reqPath.startsWith("index")) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(500);
      res.end("Error");
      return;
    }
    const ext = path.extname(file);
    res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Serving at http://localhost:${port} (no CSP)`);
});
