import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 8000);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

createServer(async (request, response) => {
  let filePath;
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    filePath = resolve(root, `.${pathname}`);
  } catch (error) {
    response.writeHead(400).end("Invalid URL");
    return;
  }

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const targetPath = filePath === root ? resolve(root, "index.html") : filePath;
    const content = await readFile(targetPath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(targetPath)] || "application/octet-stream" });
    response.end(content);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      response.writeHead(404).end("Not found");
      return;
    }
    console.error("Could not serve requested file:", error);
    response.writeHead(500).end("Internal server error");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`FitDesk is available at http://localhost:${port}`);
});
