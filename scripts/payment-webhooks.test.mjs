import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createRequire } from "node:module";
const nodeRequire = createRequire(import.meta.url);

// Load project TypeScript without adding a runtime dependency or contacting providers.
function load(file, mocks = {}) {
  const filename = path.resolve(file);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (id) => {
    if (id in mocks) return mocks[id];
    if (id.startsWith("@/")) return load(`${id.slice(2)}.ts`, mocks);
    if (id.startsWith(".")) return load(path.resolve(path.dirname(filename), `${id}.ts`), mocks);
    return nodeRequire(id);
  };
  new Function("require", "module", "exports", output)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

const { verifyWebhookSignature } = load("app/lib/bachs/webhooks.ts");
const { processBachsWebhook } = load("app/lib/bachs/process-webhook.ts");
const secret = "test-signing-secret";
const event = { id: "evt_test", type: "collection.succeeded", data: { checkout_id: "chk_test" } };
function signed(body, timestamp = String(Math.floor(Date.now() / 1000)), v2 = false) {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return new Headers(v2
    ? { "x-bachs-signature-v2": `t=${timestamp},v1=${"0".repeat(64)},v1=${digest}` }
    : { "x-bachs-timestamp": timestamp, "x-bachs-signature": digest });
}

test("accepts legacy HMAC and rotated V2 signatures", () => {
  const body = JSON.stringify(event);
  for (const v2 of [false, true]) assert.deepEqual(verifyWebhookSignature(body, signed(body, undefined, v2), secret), event);
});
test("rejects secret-as-signature, tampering, stale timestamps, and malformed events", () => {
  const body = JSON.stringify(event);
  assert.throws(() => verifyWebhookSignature(body, new Headers({ "x-bachs-signature": secret }), secret));
  assert.throws(() => verifyWebhookSignature(body + " ", signed(body), secret));
  assert.throws(() => verifyWebhookSignature(body, signed(body, "1"), secret));
  for (const malformed of ["null", "{}", '{"id":"evt","type":"collection.succeeded","data":[]}']) {
    assert.throws(() => verifyWebhookSignature(malformed, signed(malformed), secret), /Invalid webhook event/);
  }
});

function dependencies(overrides = {}) {
  const updates = [];
  return { updates, findByCheckout: async () => ({ id: "order", bachsCheckoutId: "chk_test" }),
    findByReference: async () => null, update: async (...args) => { updates.push(args); }, ...overrides };
}
test("maps payment lifecycle events without fabricating charge/payment IDs", async () => {
  for (const [type, status] of Object.entries({
    "collection.succeeded": "confirmed", "collection.failed": "checkout_failed",
    "collection.abandoned": "checkout_abandoned", "collection.underpaid": "checkout_underpaid",
    "checkout.expired": "checkout_expired",
  })) {
    const deps = dependencies();
    await processBachsWebhook({ ...event, type }, deps);
    assert.deepEqual(deps.updates, [["order", status, null, null]]);
  }
});
test("matches reference-only deliveries and returns retry for unmatched or conflicting checkouts", async () => {
  const deps = dependencies({ findByReference: async () => ({ id: "order", bachsCheckoutId: "chk_test" }) });
  await processBachsWebhook({ ...event, data: { reference: "TWC-test", charge_id: "ch_test" } }, deps);
  assert.deepEqual(deps.updates, [["order", "confirmed", "ch_test", null]]);
  for (const mismatch of [null, { id: "order", bachsCheckoutId: "other" }, { id: "manual", bachsCheckoutId: null }]) {
    const missing = dependencies({ findByCheckout: async () => null, findByReference: async () => mismatch });
    const result = await processBachsWebhook({ ...event, data: { checkout_id: "chk_test", reference: "ref" } }, missing);
    assert.equal(result.retry, true);
    assert.equal(missing.updates.length, 0);
  }
});
test("ignores unrelated deposits and checkout.completed instead of falsely confirming payment", async () => {
  const deps = dependencies();
  await processBachsWebhook({ ...event, data: {} }, deps);
  await processBachsWebhook({ ...event, type: "checkout.completed" }, deps);
  assert.equal(deps.updates.length, 0);
});

test("HTTP handler rejects invalid signatures and asks Bachs to retry unmatched orders", async () => {
  const previousSecret = process.env.BACHS_WEBHOOK_SECRET;
  process.env.BACHS_WEBHOOK_SECRET = secret;
  try {
    const deps = dependencies({ findByCheckout: async () => null });
    const { POST } = load("app/api/webhooks/bachs/route.ts", {
      "@/app/lib/preorders/data": {
        getPreorderByBachsCheckoutId: deps.findByCheckout,
        getPreorderByOrderReference: deps.findByReference,
        updateBachsPaymentStatus: deps.update,
      },
    });
    const body = JSON.stringify(event);
    const request = (headers) => new Request("https://example.com/api/webhooks/bachs", { method: "POST", body, headers });
    assert.equal((await POST(request(new Headers()))).status, 401);
    assert.equal((await POST(request(signed(body)))).status, 503);
    assert.equal(deps.updates.length, 0);
  } finally {
    if (previousSecret === undefined) delete process.env.BACHS_WEBHOOK_SECRET;
    else process.env.BACHS_WEBHOOK_SECRET = previousSecret;
  }
});

test("generated SQL guards confirmed payments and retries atomically; manual actions exclude checkouts", async () => {
  const { neon } = nodeRequire("@neondatabase/serverless");
  const { drizzle } = nodeRequire("drizzle-orm/neon-http");
  const db = drizzle(neon("postgresql://test:test@localhost/test"));
  const queries = [];
  const mockDb = { update(table) {
    const builder = db.update(table);
    const originalSet = builder.set.bind(builder);
    builder.set = (values) => {
      const query = originalSet(values);
      const originalReturning = query.returning.bind(query);
      query.returning = () => {
        queries.push(originalReturning().toSQL());
        return Promise.resolve([]);
      };
      return query;
    };
    return builder;
  } };
  const data = load("app/lib/preorders/data.ts", { "@/app/lib/db": { getDb: () => mockDb } });
  for (const status of ["confirmed", "checkout_failed", "checkout_expired"]) {
    await data.updateBachsPaymentStatus("order", status, null, null);
    const query = queries.at(-1);
    assert.match(query.sql, /where .*"id" = .*"payment_status" <> .*"payment_status" <>/);
    assert.deepEqual(query.params.slice(-3), ["order", "confirmed", status]);
    if (status === "confirmed") assert.match(query.sql, /"invoice_number" =/);
    else assert.doesNotMatch(query.sql, /"invoice_number" =/);
    assert.doesNotMatch(query.sql, /"bachs_charge_id" =/);
  }
  for (const action of [data.confirmPreorderPayment, data.rejectPreorderPayment]) {
    await action("order");
    assert.match(queries.at(-1).sql, /where .*"payment_status" = .*"bachs_checkout_id" is null/);
  }
});

