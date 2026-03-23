const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const FREE_DAILY_LIMIT = 50;
const PRO_DAILY_LIMIT = 1000;
const MIN_RESULTS = 20;

/**
 * Local fallback only.
 */
const memoryStore = global.__stylesyncShoppingStore || new Map();
global.__stylesyncShoppingStore = memoryStore;

/* -----------------------------
   🔥 IMPROVED URL HANDLING
-------------------------------- */

function isWeakStoreUrl(url) {
  const normalized = String(url || "").trim().toLowerCase();

  if (!normalized.startsWith("http")) return true;

  // Detect homepage / non-product URLs
  return (
    normalized.split("/").length <= 3 || // shallow path
    normalized.endsWith(".com") ||
    normalized.endsWith(".com/") ||
    normalized.endsWith(".nl") ||
    normalized.endsWith(".nl/") ||
    normalized.endsWith(".co.uk") ||
    normalized.endsWith(".co.uk/") ||
    normalized.endsWith(".com.au") ||
    normalized.endsWith(".com.au/") ||
    normalized.includes("/women") ||
    normalized.includes("/men") ||
    normalized.includes("/new") ||
    normalized.includes("/search") ||
    normalized.includes("query=")
  );
}

function getCountrySearchHint(country) {
  const map = {
    nl: "Netherlands",
    uk: "United Kingdom",
    gb: "United Kingdom",
    us: "United States",
    fr: "France",
    es: "Spain",
    au: "Australia",
  };
  return map[country?.toLowerCase()] || country || "";
}

function buildGoogleProductSearchUrl(item) {
  const store = item?.store || "";
  const title = item?.title || "";
  const color = item?.color || "";
  const category = item?.category || "";
  const country = getCountrySearchHint(item?.country || "");

  const storeSites = {
    zara: "site:zara.com",
    "h&m": "site:hm.com",
    hm: "site:hm.com",
    asos: "site:asos.com",
    zalando: "site:zalando.nl OR site:zalando.com",
    mango: "site:mango.com",
    sezane: "site:sezane.com",
    revolve: "site:revolve.com",
    nordstrom: "site:nordstrom.com",
    selfridges: "site:selfridges.com",
    "the iconic": "site:theiconic.com.au",
  };

  const normalizedStore = store.toLowerCase();

  const matchedSite =
    Object.keys(storeSites).find((key) =>
      normalizedStore.includes(key)
    ) || "";

  const query = [
    matchedSite ? storeSites[matchedSite] : "",
    `"${title}"`,
    store,
    color,
    category,
    country,
    "buy",
  ]
    .filter(Boolean)
    .join(" ");

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function getResponseBuyUrl(item) {
  // If URL is strong → use it
  if (item?.buyUrl && !isWeakStoreUrl(item.buyUrl)) {
    return item.buyUrl;
  }

  // Otherwise → fallback to Google search
  return buildGoogleProductSearchUrl(item);
}

/* -----------------------------
   (UNCHANGED CORE LOGIC BELOW)
-------------------------------- */

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

function normalizeString(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => normalizeString(v)).filter(Boolean);
}

function uniqueList(arr) {
  return [...new Set(arr)];
}

/* -----------------------------
   🚀 MAIN HANDLER
-------------------------------- */

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const { results = [] } = req.body || {};

    const enriched = results.map((item) => ({
      ...item,
      buyUrl: getResponseBuyUrl(item),
    }));

    return res.status(200).json({
      results: enriched,
    });
  } catch (error) {
    console.error("smart-shopping error:", error);

    return res.status(500).json({
      error: "Smart shopping failed.",
    });
  }
};
