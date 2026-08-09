let cachedRate: { rate: number; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getGhsUsdRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL_MS) {
    return cachedRate.rate;
  }

  const res = await fetch("https://open.er-api.com/v6/latest/GHS", {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch exchange rate");
  }

  const data = (await res.json()) as { rates: Record<string, number> };
  const rate = data.rates?.USD;

  if (!rate || rate <= 0) {
    throw new Error("Invalid exchange rate data");
  }

  cachedRate = { rate, fetchedAt: Date.now() };
  return rate;
}

export function convertGhsToUsd(ghsAmount: number, ghsToUsdRate: number): string {
  return (ghsAmount * ghsToUsdRate).toFixed(2);
}

export function formatUsd(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `USD ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
