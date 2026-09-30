type MarketRow = { symbol: string; price: number | null; error?: string };

const ALLOWED = new Set(["EUR/USD","GBP/USD","USD/JPY","XAU/USD","XAG/USD","USOIL"]);

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) {
    res.status(500).json({ error: "TWELVE_DATA_API_KEY is not configured." });
    return;
  }

  const requested = String(req.query?.symbols || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string) => ALLOWED.has(s));

  const symbols = [...new Set(requested)];
  if (!symbols.length) {
    res.status(400).json({ error: "Provide at least one supported symbol." });
    return;
  }

  const url = new URL("https://api.twelvedata.com/price");
  url.searchParams.set("symbol", symbols.join(","));
  url.searchParams.set("apikey", key);

  try {
    const response = await fetch(url);
    const payload = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: payload?.message || "Twelve Data request failed." });
      return;
    }

    const rows: MarketRow[] = symbols.map((symbol) => {
      const item = payload?.[symbol] ?? payload;
      const price = Number(item?.price);
      return {
        symbol,
        price: Number.isFinite(price) ? price : null,
        ...(item?.message ? { error: item.message } : {}),
      };
    });

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json({ source: "Twelve Data", updatedAt: new Date().toISOString(), data: rows });
  } catch {
    res.status(502).json({ error: "Unable to reach Twelve Data." });
  }
}
