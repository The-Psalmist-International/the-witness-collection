# Payment status updates

Bachs delivers payment events to `POST /api/webhooks/bachs`. Set
`BACHS_WEBHOOK_SECRET` to this endpoint's signing secret in the deployment
environment. The handler verifies timestamped HMAC signatures, preferring V2
and supporting the legacy timestamp/signature headers.

Subscribe the endpoint to `collection.succeeded`, `collection.failed`,
`collection.underpaid`, and `checkout.expired`. The handler also accepts
`collection.abandoned` for existing integrations that send it.

Successful collections set payment status to `confirmed` and issue an invoice.
The separate order fulfillment status is unchanged. Failures do not cancel the
order; a subsequent successful collection can still confirm payment. Confirmed
payments cannot be downgraded by later events, and repeated success deliveries
preserve the original invoice and confirmation time.

Orders match by checkout ID, with the supplied order reference as a fallback.
An unmatched checkout returns 503 so Bachs can retry. Collections with neither
identifier are logged and ignored because they may be unrelated virtual-account
deposits. No checkout ID is substituted for a missing charge or payment ID.

The admin Payments page includes all payment statuses. Dashboard, Orders, and
Payments refresh every 15 seconds while visible, and when the tab becomes visible.

## Verification and recovery

Run `node --test scripts/payment-webhooks.test.mjs` for signature, lifecycle,
HTTP response, and generated SQL guard checks. These tests do not contact Bachs
or a database and do not prove live webhook delivery or browser behavior.

After deploying, verify that the Bachs endpoint is enabled, its URL is correct,
the signing secret matches, and the required events are subscribed. Complete a
sandbox payment and verify the delivery response, saved payment status, invoice,
and admin refresh. Replay previously failed success events to recover stuck
payments; deploying the code alone does not backfill them. Do not manually mark
an order paid without provider confirmation.

Provider reference: https://docs.bachs.io/guides/webhooks/overview
