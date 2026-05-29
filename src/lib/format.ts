export function formatPrice(n: number | string | null | undefined) {
  if (n === null || n === undefined) return "";
  const num = typeof n === "string" ? Number(n) : n;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
