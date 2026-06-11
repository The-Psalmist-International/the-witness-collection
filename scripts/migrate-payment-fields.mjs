import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const contents = readFileSync(envPath, "utf8");

    for (const line of contents.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional when DATABASE_URL is already exported.
  }
}

function generateOrderReference() {
  const suffix = Math.random().toString(16).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `TWC-${stamp}${suffix}`;
}

async function main() {
  loadEnv();

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = neon(connectionString);

  await sql`ALTER TABLE preorders ADD COLUMN IF NOT EXISTS order_reference varchar(32)`;
  await sql`ALTER TABLE preorders ADD COLUMN IF NOT EXISTS payment_status varchar(32) DEFAULT 'pending_confirmation'`;
  await sql`ALTER TABLE preorders ADD COLUMN IF NOT EXISTS payment_proof_url text`;
  await sql`ALTER TABLE preorders ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at timestamptz`;
  await sql`ALTER TABLE preorders ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz`;
  await sql`ALTER TABLE preorders ADD COLUMN IF NOT EXISTS invoice_number varchar(32)`;
  await sql`ALTER TABLE preorders ADD COLUMN IF NOT EXISTS invoice_issued_at timestamptz`;

  await sql`
    UPDATE preorders
    SET payment_status = 'pending_confirmation'
    WHERE payment_status IS NULL
  `;

  const rows = await sql`
    SELECT id
    FROM preorders
    WHERE order_reference IS NULL
  `;

  for (const row of rows) {
    await sql`
      UPDATE preorders
      SET order_reference = ${generateOrderReference()}
      WHERE id = ${row.id}
    `;
  }

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'preorders_order_reference_unique'
      ) THEN
        ALTER TABLE preorders
        ADD CONSTRAINT preorders_order_reference_unique UNIQUE (order_reference);
      END IF;
    END $$;
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'preorders_invoice_number_unique'
      ) THEN
        ALTER TABLE preorders
        ADD CONSTRAINT preorders_invoice_number_unique UNIQUE (invoice_number);
      END IF;
    END $$;
  `;

  console.log("Payment and invoice columns are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
