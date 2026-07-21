const SANDBOX_BASE_URL = "https://sandbox-api.bachs.io";
const PRODUCTION_BASE_URL = "https://api.bachs.io";

export function getBachsConfig() {
  const secretKey = process.env.BACHS_SECRET_KEY;
  const baseUrl = process.env.BACHS_BASE_URL;
  const webhookSecret = process.env.BACHS_WEBHOOK_SECRET;

  if (!secretKey) {
    throw new Error(
      "BACHS_SECRET_KEY is not set. Use sk_sandbox_ keys for sandbox, sk_live_ keys for production."
    );
  }

  if (!baseUrl) {
    throw new Error("BACHS_BASE_URL is not set.");
  }

  const isSandbox = secretKey.startsWith("sk_sandbox_");
  const expectedBaseUrl = isSandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL;

  if (baseUrl !== expectedBaseUrl) {
    throw new Error(
      `BACHS_BASE_URL "${baseUrl}" does not match the key prefix. ` +
        `Expected "${expectedBaseUrl}" for ${isSandbox ? "sandbox" : "production"} keys.`
    );
  }

  return { secretKey, baseUrl, webhookSecret };
}
