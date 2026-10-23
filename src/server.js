import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { selectTasks } from "./tasks.js";

const assets = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
]);

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

export function createServer() {
  return createHttpServer(async (request, response) => {
    const start = performance.now();
    const url = new URL(request.url, "http://localhost");
    response.on("finish", () => {
      console.log(JSON.stringify({
        event: "http_request", method: request.method, path: url.pathname,
        status: response.statusCode, durationMs: Math.round(performance.now() - start),
      }));
    });
    try {
      if (request.method !== "GET") {
        response.setHeader("allow", "GET");
        return json(response, 405, { error: "Method not allowed" });
      }
      if (url.pathname === "/api/tasks") {
        const items = selectTasks(url.searchParams);
        return json(response, 200, { items, count: items.length });
      }
      if (!assets.has(url.pathname)) {
        return json(response, 404, { error: "Not found" });
      }
      const [file, contentType] = assets.get(url.pathname);
      const content = await readFile(new URL(`../public/${file}`, import.meta.url));
      response.writeHead(200, { "content-type": contentType });
      response.end(content);
    } catch (error) {
      if (error instanceof RangeError) {
        return json(response, 400, { error: error.message });
      }
      console.error(JSON.stringify({ event: "request_error", message: error.message }));
      json(response, 500, { error: "Internal server error" });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createServer();
  server.on("error", error => {
    console.error(`Cannot start TaskBoard: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, "127.0.0.1", () => {
    console.log(`TaskBoard: http://127.0.0.1:${server.address().port}`);
  });
}
