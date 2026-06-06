export function parsePriceLabel(label: string) {
  const value = Number(label.replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

export function formatGhsAmount(amount: number) {
  return `GHS ${new Intl.NumberFormat("en-GH", {
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
