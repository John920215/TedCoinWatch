export async function fetchPrices(ids, vs = "usd") {
  const qs = new URLSearchParams({
    ids: ids.join(","),
    vs_currencies: vs,
  });
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Price fetch failed: ${res.status}`);
  return res.json(); // { bitcoin: { usd: 12345 }, ... }
}