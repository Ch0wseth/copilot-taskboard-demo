import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "../../../../src/server.js";

const server = createServer();
let base;

before(async () => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
  console.log(`taskboard-api-check: real HTTP requests to ${base}`);
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

async function get(query = "") {
  const response = await fetch(`${base}/api/tasks${query}`, {
    signal: AbortSignal.timeout(3000),
  });
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  return { status: response.status, body: await response.json() };
}

function checkList(result, ids) {
  assert.equal(result.status, 200);
  assert.deepEqual(Object.keys(result.body).sort(), ["count", "items"]);
  assert.deepEqual(result.body.items.map(task => task.id), ids);
  assert.equal(result.body.count, ids.length);
}

test("unfiltered contract: IDs 1,2,3,4 and count 4", { timeout: 5000 }, async () => {
  checkList(await get(), [1, 2, 3, 4]);
});

test("status=open: IDs 1,3, both open, count 2", { timeout: 5000 }, async () => {
  const result = await get("?status=open");
  checkList(result, [1, 3]);
  assert.ok(result.body.items.every(task => task.status === "open"));
});

test("filtering does not mutate the unfiltered list", { timeout: 8000 }, async () => {
  await get("?status=open");
  checkList(await get(), [1, 2, 3, 4]);
});

for (const query of [
  "status=", "status=done", "status=OPEN", "status=unknown",
  "status=open&status=open", "status=&status=open", "status=open&status=",
]) {
  test(`invalid query returns structured 400: ${query}`, { timeout: 5000 }, async () => {
    const result = await get(`?${query}`);
    assert.equal(result.status, 400);
    assert.deepEqual(result.body, { error: "Use exactly one status=open parameter" });
  });
}
