import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "../src/server.js";

const server = createServer();
let base;
before(async () => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test("GET /api/tasks preserves the list response contract", async () => {
  const response = await fetch(`${base}/api/tasks`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(body).sort(), ["count", "items"]);
  assert.deepEqual(body.items.map(task => task.id), [1, 2, 3, 4]);
  assert.equal(body.count, body.items.length);
});

test("GET / serves the task page", async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(await response.text(), /Team tasks/);
});

test("unknown resources return a structured 404", async () => {
  const response = await fetch(`${base}/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Not found" });
});

test("write requests are rejected", async () => {
  const response = await fetch(`${base}/api/tasks`, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});

test("open filtering preserves order, count and the unfiltered list", async () => {
  const response = await fetch(`${base}/api/tasks?status=open`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(body).sort(), ["count", "items"]);
  assert.deepEqual(body.items.map(task => task.id), [1, 3]);
  assert.ok(body.items.every(task => task.status === "open"));
  assert.equal(body.count, 2);
  const all = await (await fetch(`${base}/api/tasks`)).json();
  assert.deepEqual(all.items.map(task => task.id), [1, 2, 3, 4]);
  assert.equal(all.count, 4);
});

for (const query of [
  "status=", "status=done", "status=OPEN", "status=unknown",
  "status=open&status=open", "status=&status=open", "status=open&status=",
]) {
  test(`invalid filter returns 400: ${query}`, async () => {
    const response = await fetch(`${base}/api/tasks?${query}`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "Use exactly one status=open parameter",
    });
  });
}
