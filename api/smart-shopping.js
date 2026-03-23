const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const FREE_DAILY_LIMIT = 50;
const PRO_DAILY_LIMIT = 1000;
const MIN_RESULTS = 20;
const AI_SHORTLIST_SIZE = 12;
const AI_FINAL_PICK_COUNT = 8;

/**
 * Local fallback only.
 * Useful during local development if KV is not configured.
 */
const memoryStore = global.__stylesyncShoppingStore || new Map();
global.__stylesyncShoppingStore = memoryStore;

const MOCK_STORE_CATALOG = [
  {
    id: "zara-women-structured-cream-blazer",
    title: "Structured Cream Blazer",
    store: "Zara",
    country: "NL",
    gender: "female",
    category: "jacket",
    styleTags: ["classic", "elegant", "minimal"],
    color: "cream",
    price: 89.99,
    currency: "EUR",
    sizeLabel: "XS–L",
    fitTags: ["tailored", "polished"],
    bodyTypeTags: ["hourglass", "rectangle", "pear"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["work", "dinner"],
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.zara.com",
  },
  {
    id: "hm-women-high-waist-black-trousers",
    title: "High-Waist Black Trousers",
    store: "H&M",
    country: "NL",
    gender: "female",
    category: "bottom",
    styleTags: ["minimal", "classic", "elegant"],
    color: "black",
    price: 39.99,
    currency: "EUR",
    sizeLabel: "EU 34–44",
    fitTags: ["high-waist", "elongating"],
    bodyTypeTags: ["petite", "pear", "hourglass", "rectangle"],
    heightCategoryTags: ["petite", "regular"],
    occasionTags: ["work", "casual", "dinner"],
    image:
      "https://images.unsplash.com/photo-1506629905607-d9b1a3b2f16b?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www2.hm.com",
  },
  {
    id: "asos-women-satin-midi-skirt",
    title: "Satin Midi Skirt",
    store: "ASOS",
    country: "NL",
    gender: "female",
    category: "bottom",
    styleTags: ["elegant", "trendy", "classic"],
    color: "brown",
    price: 45,
    currency: "EUR",
    sizeLabel: "EU 32–46",
    fitTags: ["fluid", "soft drape"],
    bodyTypeTags: ["pear", "hourglass", "rectangle"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["dinner", "party", "wedding"],
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a13d57?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.asos.com",
  },
  {
    id: "zalando-women-cropped-tweed-jacket",
    title: "Cropped Tweed Jacket",
    store: "Zalando",
    country: "NL",
    gender: "female",
    category: "jacket",
    styleTags: ["classic", "elegant"],
    color: "cream",
    price: 79.95,
    currency: "EUR",
    sizeLabel: "EU 34–42",
    fitTags: ["cropped", "structured"],
    bodyTypeTags: ["petite", "pear", "hourglass"],
    heightCategoryTags: ["petite", "regular"],
    occasionTags: ["work", "dinner", "wedding"],
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.zalando.nl",
  },
  {
    id: "mango-women-wide-leg-trousers",
    title: "Wide-Leg Tailored Trousers",
    store: "Mango",
    country: "NL",
    gender: "female",
    category: "bottom",
    styleTags: ["minimal", "elegant", "classic"],
    color: "grey",
    price: 59.99,
    currency: "EUR",
    sizeLabel: "EU 32–44",
    fitTags: ["wide-leg", "tailored"],
    bodyTypeTags: ["tall", "apple", "inverted triangle", "rectangle"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["work", "dinner"],
    image:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://shop.mango.com",
  },
  {
    id: "sezane-women-knit-top",
    title: "Soft Knit Fitted Top",
    store: "Sézane",
    country: "FR",
    gender: "female",
    category: "top",
    styleTags: ["classic", "minimal", "elegant"],
    color: "blue",
    price: 85,
    currency: "EUR",
    sizeLabel: "XS–XL",
    fitTags: ["fitted", "soft"],
    bodyTypeTags: ["hourglass", "rectangle", "pear"],
    heightCategoryTags: ["petite", "regular", "tall"],
    occasionTags: ["casual", "work", "dinner"],
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.sezane.com",
  },
  {
    id: "revolve-women-wrap-dress",
    title: "Wrap Midi Dress",
    store: "Revolve",
    country: "US",
    gender: "female",
    category: "dress",
    styleTags: ["elegant", "trendy"],
    color: "red",
    price: 128,
    currency: "USD",
    sizeLabel: "XXS–XL",
    fitTags: ["wrap", "waist-defining"],
    bodyTypeTags: ["hourglass", "pear", "rectangle"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["dinner", "party", "wedding"],
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.revolve.com",
  },
  {
    id: "nordstrom-women-longline-coat",
    title: "Longline Wool Coat",
    store: "Nordstrom",
    country: "US",
    gender: "female",
    category: "jacket",
    styleTags: ["classic", "elegant"],
    color: "brown",
    price: 189,
    currency: "USD",
    sizeLabel: "XS–XL",
    fitTags: ["longline", "structured"],
    bodyTypeTags: ["tall", "apple", "rectangle"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["work", "travel", "dinner"],
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.nordstrom.com",
  },
  {
    id: "asos-women-monochrome-set-top",
    title: "Minimal Monochrome Top",
    store: "ASOS",
    country: "UK",
    gender: "female",
    category: "top",
    styleTags: ["minimal", "classic"],
    color: "white",
    price: 28,
    currency: "GBP",
    sizeLabel: "UK 6–16",
    fitTags: ["clean-line", "lightweight"],
    bodyTypeTags: ["petite", "rectangle", "apple"],
    heightCategoryTags: ["petite", "regular"],
    occasionTags: ["casual", "work"],
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.asos.com",
  },
  {
    id: "zara-women-straight-denim",
    title: "Straight-Leg Denim",
    store: "Zara",
    country: "NL",
    gender: "female",
    category: "bottom",
    styleTags: ["casual", "minimal", "trendy"],
    color: "blue",
    price: 49.95,
    currency: "EUR",
    sizeLabel: "EU 32–44",
    fitTags: ["straight-leg", "versatile"],
    bodyTypeTags: ["pear", "rectangle", "apple", "petite"],
    heightCategoryTags: ["petite", "regular"],
    occasionTags: ["casual", "travel"],
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.zara.com",
  },
  {
    id: "selfridges-women-occasion-heels",
    title: "Elegant Occasion Heels",
    store: "Selfridges",
    country: "UK",
    gender: "female",
    category: "shoes",
    styleTags: ["elegant", "classic"],
    color: "cream",
    price: 145,
    currency: "GBP",
    sizeLabel: "EU 36–41",
    fitTags: ["occasion", "refined"],
    bodyTypeTags: ["pear", "apple", "hourglass", "rectangle", "inverted triangle"],
    heightCategoryTags: ["petite", "regular", "tall"],
    occasionTags: ["party", "wedding", "dinner"],
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.selfridges.com",
  },
  {
    id: "theiconic-women-oversized-shirt",
    title: "Oversized Cotton Shirt",
    store: "The Iconic",
    country: "AU",
    gender: "female",
    category: "top",
    styleTags: ["casual", "minimal", "trendy"],
    color: "blue",
    price: 69.95,
    currency: "AUD",
    sizeLabel: "AU 6–16",
    fitTags: ["oversized", "layering"],
    bodyTypeTags: ["tall", "rectangle", "apple"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["casual", "travel", "work"],
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.theiconic.com.au",
  },
  {
    id: "hm-men-tailored-navy-blazer",
    title: "Tailored Navy Blazer",
    store: "H&M",
    country: "NL",
    gender: "male",
    category: "jacket",
    styleTags: ["classic", "elegant", "minimal"],
    color: "blue",
    price: 79.99,
    currency: "EUR",
    sizeLabel: "EU 46–56",
    fitTags: ["tailored", "structured"],
    bodyTypeTags: ["rectangle", "apple", "tall"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["work", "dinner", "wedding"],
    image:
      "https://images.unsplash.com/photo-1593032465171-8bd9f97ff1e1?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www2.hm.com",
  },
  {
    id: "zara-men-straight-trousers",
    title: "Straight Tailored Trousers",
    store: "Zara",
    country: "NL",
    gender: "male",
    category: "bottom",
    styleTags: ["classic", "minimal"],
    color: "black",
    price: 49.95,
    currency: "EUR",
    sizeLabel: "EU 38–48",
    fitTags: ["straight", "tailored"],
    bodyTypeTags: ["rectangle", "apple", "inverted triangle"],
    heightCategoryTags: ["petite", "regular", "tall"],
    occasionTags: ["work", "dinner"],
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.zara.com",
  },
  {
    id: "asos-men-overshirt",
    title: "Layered Overshirt",
    store: "ASOS",
    country: "UK",
    gender: "male",
    category: "jacket",
    styleTags: ["casual", "trendy"],
    color: "green",
    price: 42,
    currency: "GBP",
    sizeLabel: "XS–XXL",
    fitTags: ["layering", "relaxed"],
    bodyTypeTags: ["tall", "rectangle"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["casual", "travel"],
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.asos.com",
  },
  {
    id: "mango-men-lightweight-knit",
    title: "Lightweight Knit Polo",
    store: "Mango",
    country: "ES",
    gender: "male",
    category: "top",
    styleTags: ["minimal", "classic", "elegant"],
    color: "cream",
    price: 45.99,
    currency: "EUR",
    sizeLabel: "S–XL",
    fitTags: ["clean-line", "refined"],
    bodyTypeTags: ["apple", "rectangle", "inverted triangle"],
    heightCategoryTags: ["petite", "regular", "tall"],
    occasionTags: ["work", "casual", "dinner"],
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://shop.mango.com",
  },
  {
    id: "nordstrom-men-long-coat",
    title: "Modern Long Coat",
    store: "Nordstrom",
    country: "US",
    gender: "male",
    category: "jacket",
    styleTags: ["classic", "elegant"],
    color: "grey",
    price: 210,
    currency: "USD",
    sizeLabel: "S–XL",
    fitTags: ["longline", "structured"],
    bodyTypeTags: ["tall", "rectangle"],
    heightCategoryTags: ["regular", "tall"],
    occasionTags: ["work", "travel", "dinner"],
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.nordstrom.com",
  },
  {
    id: "zalando-men-smart-sneakers",
    title: "Smart Minimal Sneakers",
    store: "Zalando",
    country: "NL",
    gender: "male",
    category: "shoes",
    styleTags: ["minimal", "casual", "classic"],
    color: "white",
    price: 89.95,
    currency: "EUR",
    sizeLabel: "EU 40–46",
    fitTags: ["smart-casual", "versatile"],
    bodyTypeTags: ["apple", "rectangle", "inverted triangle", "tall"],
    heightCategoryTags: ["petite", "regular", "tall"],
    occasionTags: ["casual", "travel", "work"],
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    buyUrl: "https://www.zalando.nl",
  },
];

/* -----------------------------
   URL HANDLING
-------------------------------- */

function isWeakStoreUrl(url) {
  const normalized = String(url || "").trim().toLowerCase();

  if (!normalized.startsWith("http")) return true;

  return (
    normalized.split("/").length <= 3 ||
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

  return map[String(country || "").toLowerCase()] || country || "";
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
    "sézane": "site:sezane.com",
    revolve: "site:revolve.com",
    nordstrom: "site:nordstrom.com",
    selfridges: "site:selfridges.com",
    "the iconic": "site:theiconic.com.au",
  };

  const normalizedStore = String(store).toLowerCase();
  const matchedSite =
    Object.keys(storeSites).find((key) => normalizedStore.includes(key)) || "";

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
  if (item?.buyUrl && !isWeakStoreUrl(item.buyUrl)) {
    return item.buyUrl;
  }

  return buildGoogleProductSearchUrl(item);
}

/* -----------------------------
   BASIC HELPERS
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

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeString(item)).filter(Boolean);
}

function uniqueList(arr) {
  return [...new Set(arr)];
}

function safeNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function ensureStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getSecondsUntilNextUtcMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + 1);
  next.setUTCHours(0, 0, 0, 0);
  return Math.max(60, Math.floor((next.getTime() - now.getTime()) / 1000));
}

function normalizeUserId(userId) {
  return String(userId || "").trim();
}

function getProUserIds() {
  return String(process.env.PRO_USER_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getUserPlan(userId) {
  return getProUserIds().includes(userId) ? "pro" : "free";
}

function getPlanLimit(plan) {
  return plan === "pro" ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
}

function getUsageKey(userId, dateKey) {
  return `smart-shopping:${userId}:${dateKey}`;
}

async function getKvClient() {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv || mod.default || null;
  } catch (error) {
    return null;
  }
}

async function getUsageCount(userId, dateKey) {
  const key = getUsageKey(userId, dateKey);
  const kv = await getKvClient();

  if (kv) {
    const value = await kv.get(key);
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const value = memoryStore.get(key);
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function setUsageCount(userId, dateKey, count) {
  const key = getUsageKey(userId, dateKey);
  const secondsUntilReset = getSecondsUntilNextUtcMidnight();
  const kv = await getKvClient();

  if (kv) {
    await kv.set(key, count, { ex: secondsUntilReset });
    return;
  }

  memoryStore.set(key, count);
}

async function incrementUsageCount(userId, dateKey) {
  const current = await getUsageCount(userId, dateKey);
  const next = current + 1;
  await setUsageCount(userId, dateKey, next);
  return next;
}

function convertBodyTypeToCatalogSignals(bodyType) {
  const normalized = normalizeString(bodyType).replace(/^likely\s+/, "");

  if (!normalized) return [];

  const mapped = [normalized];

  if (normalized.includes("balanced")) {
    mapped.push("rectangle", "hourglass");
  }

  if (normalized.includes("oval")) {
    mapped.push("apple");
  }

  return uniqueList(mapped);
}

function buildWardrobeCategoryCounts(wardrobe) {
  const counts = {
    top: 0,
    bottom: 0,
    dress: 0,
    shoes: 0,
    jacket: 0,
    accessory: 0,
  };

  if (!Array.isArray(wardrobe)) return counts;

  wardrobe.forEach((item) => {
    const category = normalizeString(item?.category);
    if (Object.prototype.hasOwnProperty.call(counts, category)) {
      counts[category] += 1;
    }
  });

  return counts;
}

function getWardrobeGapCategories(wardrobe) {
  const counts = buildWardrobeCategoryCounts(wardrobe);

  return Object.entries(counts)
    .sort((a, b) => a[1] - b[1])
    .map(([category]) => category)
    .slice(0, 3);
}

function profileGenderToCatalogGender(profile) {
  const gender = normalizeString(profile?.gender);

  if (gender === "woman" || gender === "women" || gender === "female") {
    return "female";
  }

  if (gender === "man" || gender === "men" || gender === "male") {
    return "male";
  }

  return "";
}

function matchesDoNotInclude(product, doNotInclude) {
  const blockedTerms = normalizeArray(doNotInclude);

  if (blockedTerms.length === 0) return false;

  const haystack = [
    product.title,
    product.store,
    product.category,
    product.color,
    ...(product.styleTags || []),
    ...(product.fitTags || []),
    ...(product.occasionTags || []),
  ]
    .join(" ")
    .toLowerCase();

  return blockedTerms.some((term) => haystack.includes(term));
}

function extractProfileStyleSignals(profile) {
  const direct = normalizeArray(
    ensureStringArray(profile?.stylePreference).concat(
      ensureStringArray(profile?.stylePreferences)
    )
  );

  if (direct.length > 0) return direct;

  const styleText = normalizeString(profile?.stylePreference || "");
  if (!styleText) return [];

  return styleText
    .split(/[,\s/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractPreferredStores(profile, filters) {
  return uniqueList(
    normalizeArray(profile?.preferredStores)
      .concat(normalizeArray(profile?.preferredStore))
      .concat(normalizeArray(filters?.selectedStores))
  );
}

function extractPreferredColors(profile, learningMemory) {
  return uniqueList(
    normalizeArray(profile?.preferredColors)
      .concat(normalizeArray(profile?.colorPreferences))
      .concat(normalizeArray(profile?.colorPreference))
      .concat(normalizeArray(learningMemory?.likedColors))
  );
}

function scoreProduct(product, context) {
  let score = 0;
  const reasons = [];

  const {
    profile,
    wardrobe,
    bodyAnalysis,
    filters,
    learningMemory,
  } = context;

  const productGender = normalizeString(product.gender);
  const userGender = profileGenderToCatalogGender(profile);
  const productCountry = normalizeString(product.country);
  const userCountry = normalizeString(profile?.country);
  const userCurrency = normalizeString(filters?.currency || profile?.currency);
  const selectedCategory = normalizeString(filters?.selectedCategory);
  const selectedOccasion = normalizeString(filters?.selectedOccasion);
  const preferredStores = extractPreferredStores(profile, filters);
  const preferredColors = extractPreferredColors(profile, learningMemory);
  const styleSignals = extractProfileStyleSignals(profile);
  const bodyTypes = convertBodyTypeToCatalogSignals(bodyAnalysis?.bodyType);
  const fitIssues = normalizeArray(bodyAnalysis?.fitIssues);
  const shoppingFocus = normalizeArray(bodyAnalysis?.shoppingFocus);
  const bestClothing = normalizeArray(bodyAnalysis?.bestClothing);
  const goals = normalizeArray(bodyAnalysis?.goals);
  const likedStores = normalizeArray(learningMemory?.likedStores);
  const dislikedStores = normalizeArray(learningMemory?.dislikedStores);
  const likedColors = normalizeArray(learningMemory?.likedColors);
  const dislikedColors = normalizeArray(learningMemory?.dislikedColors);
  const likedCategories = normalizeArray(learningMemory?.likedCategories);
  const dislikedCategories = normalizeArray(learningMemory?.dislikedCategories);
  const dislikedItemIds = normalizeArray(learningMemory?.dislikedItemIds);
  const likedItemIds = normalizeArray(learningMemory?.likedItemIds);
  const wardrobeGapCategories = getWardrobeGapCategories(wardrobe);

  if (userGender && productGender === userGender) {
    score += 18;
    reasons.push("Matches your profile");
  } else if (userGender && productGender !== userGender) {
    score -= 40;
  }

  if (userCountry && productCountry === userCountry) {
    score += 6;
  }

  if (userCurrency && normalizeString(product.currency) === userCurrency) {
    score += 3;
  }

  if (selectedCategory) {
    if (normalizeString(product.category) === selectedCategory) {
      score += 25;
      reasons.push("Matches your category");
    } else {
      score -= 16;
    }
  }

  if (selectedOccasion) {
    if (normalizeArray(product.occasionTags).includes(selectedOccasion)) {
      score += 16;
      reasons.push("Fits the occasion");
    } else {
      score -= 8;
    }
  }

  if (preferredStores.includes(normalizeString(product.store))) {
    score += 14;
    reasons.push("From your preferred stores");
  }

  if (likedStores.includes(normalizeString(product.store))) {
    score += 12;
  }

  if (dislikedStores.includes(normalizeString(product.store))) {
    score -= 20;
  }

  if (preferredColors.some((color) => normalizeString(product.color).includes(color))) {
    score += 8;
    reasons.push("Matches your colors");
  }

  if (likedColors.some((color) => normalizeString(product.color).includes(color))) {
    score += 8;
  }

  if (dislikedColors.some((color) => normalizeString(product.color).includes(color))) {
    score -= 12;
  }

  const productStyleTags = normalizeArray(product.styleTags);
  const sharedStyles = styleSignals.filter((style) => productStyleTags.includes(style));
  if (sharedStyles.length > 0) {
    score += sharedStyles.length * 6;
    reasons.push("Matches your style");
  }

  const productBodyTags = normalizeArray(product.bodyTypeTags);
  const bodyMatches = bodyTypes.filter((type) => productBodyTags.includes(type));
  if (bodyMatches.length > 0) {
    score += bodyMatches.length * 12;
    reasons.push("Works for your body analysis");
  }

  const productFitTags = normalizeArray(product.fitTags);
  const focusSignals = shoppingFocus.concat(bestClothing).concat(goals);

  const focusMatches = focusSignals.filter((signal) => {
    const s = normalizeString(signal);
    return (
      normalizeString(product.title).includes(s) ||
      normalizeString(product.category).includes(s) ||
      normalizeString(product.color).includes(s) ||
      productFitTags.includes(s) ||
      productStyleTags.includes(s)
    );
  });

  if (focusMatches.length > 0) {
    score += Math.min(18, focusMatches.length * 6);
    reasons.push("Supports your shopping focus");
  }

  if (fitIssues.includes("long torso") && productFitTags.includes("high-waist")) {
    score += 10;
  }

  if (fitIssues.includes("short neck")) {
    if (
      normalizeString(product.title).includes("v-neck") ||
      normalizeString(product.title).includes("open") ||
      productFitTags.includes("open collar")
    ) {
      score += 7;
    }
  }

  if (likedCategories.includes(normalizeString(product.category))) {
    score += 8;
  }

  if (dislikedCategories.includes(normalizeString(product.category))) {
    score -= 12;
  }

  if (likedItemIds.includes(normalizeString(product.id))) {
    score += 18;
  }

  if (dislikedItemIds.includes(normalizeString(product.id))) {
    score -= 25;
  }

  if (wardrobeGapCategories.includes(normalizeString(product.category))) {
    score += 12;
    reasons.push("Helps balance your wardrobe");
  }

  const minBudget =
    typeof filters?.minBudget === "number" ? filters.minBudget : undefined;
  const maxBudget =
    typeof filters?.maxBudget === "number" ? filters.maxBudget : undefined;

  if (typeof minBudget === "number" && product.price < minBudget) {
    score -= 10;
  }

  if (typeof maxBudget === "number" && product.price > maxBudget) {
    score -= 16;
  }

  if (!isWeakStoreUrl(product.buyUrl)) {
    score += 3;
  }

  return {
    ...product,
    _score: score,
    _reasons: uniqueList(reasons).slice(0, 4),
  };
}

function buildReasoning(scoredResults, context) {
  const reasoning = [];
  const { filters, bodyAnalysis, wardrobe, profile } = context;
  const wardrobeGapCategories = getWardrobeGapCategories(wardrobe);
  const preferredStores = extractPreferredStores(profile, filters);

  if (normalizeString(bodyAnalysis?.bodyType)) {
    reasoning.push(
      `Matched pieces to your body analysis: ${String(bodyAnalysis.bodyType).trim()}.`
    );
  }

  if (normalizeArray(bodyAnalysis?.shoppingFocus).length > 0) {
    reasoning.push(
      `Used your shopping focus: ${normalizeArray(bodyAnalysis.shoppingFocus)
        .slice(0, 2)
        .join(" and ")}.`
    );
  }

  if (normalizeString(filters?.selectedOccasion)) {
    reasoning.push(
      `Prioritized pieces suitable for ${String(filters.selectedOccasion).trim()}.`
    );
  }

  if (normalizeString(filters?.selectedCategory)) {
    reasoning.push(
      `Filtered strongly toward ${String(filters.selectedCategory).trim()} items.`
    );
  }

  if (preferredStores.length > 0) {
    reasoning.push(
      `Boosted products from your preferred stores: ${preferredStores
        .slice(0, 3)
        .join(", ")}.`
    );
  }

  if (wardrobeGapCategories.length > 0) {
    reasoning.push(
      `Lifted categories that help balance your wardrobe: ${wardrobeGapCategories
        .slice(0, 2)
        .join(" and ")}.`
    );
  }

  if (scoredResults.length > 0) {
    const topStores = uniqueList(scoredResults.map((item) => item.store)).slice(0, 3);
    if (topStores.length > 0) {
      reasoning.push(`Best current matches came from ${topStores.join(", ")}.`);
    }
  }

  return uniqueList(reasoning).slice(0, 6);
}

function buildAiShortlistPayload(items) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    store: item.store,
    category: item.category,
    color: item.color,
    price: item.price,
    currency: item.currency,
    styleTags: item.styleTags,
    fitTags: item.fitTags,
    bodyTypeTags: item.bodyTypeTags,
    occasionTags: item.occasionTags,
    score: item._score,
  }));
}

function extractOutputText(apiResponse) {
  if (typeof apiResponse?.output_text === "string" && apiResponse.output_text) {
    return apiResponse.output_text;
  }

  if (!Array.isArray(apiResponse?.output)) return "";

  for (const item of apiResponse.output) {
    if (!Array.isArray(item?.content)) continue;

    for (const contentItem of item.content) {
      if (typeof contentItem?.text === "string" && contentItem.text.trim()) {
        return contentItem.text;
      }
    }
  }

  return "";
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function extractJsonObject(text) {
  if (!text) return null;

  const direct = safeJsonParse(text);
  if (direct) return direct;

  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const parsed = safeJsonParse(fencedMatch[1]);
    if (parsed) return parsed;
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return safeJsonParse(text.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

async function rerankWithAi(shortlist, context) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const prompt = `
You are the product ranking layer for StyleSync, a fashion AI app.

You will receive:
- user profile
- body analysis
- shopping filters
- learning memory
- a shortlist of candidate products already scored by the backend

Task:
- pick the strongest final items for the user
- prefer items that are realistic, wearable, and aligned with body analysis
- prefer exact filter matches
- preserve store/category/style diversity when possible
- do not choose products that clearly conflict with the profile or filters

Return ONLY valid JSON in this exact shape:
{
  "selectedIds": ["id1", "id2", "id3"],
  "reasoning": ["reason 1", "reason 2", "reason 3"]
}
`.trim();

  const requestBody = {
    model: process.env.OPENAI_SMART_SHOPPING_MODEL || "gpt-5-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(
              {
                prompt,
                profile: context.profile || {},
                bodyAnalysis: context.bodyAnalysis || {},
                filters: context.filters || {},
                learningMemory: context.learningMemory || {},
                shortlist: buildAiShortlistPayload(shortlist),
              },
              null,
              2
            ),
          },
        ],
      },
    ],
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    return null;
  }

  const text = extractOutputText(data);
  const parsed = extractJsonObject(text);

  if (!parsed || !Array.isArray(parsed.selectedIds)) {
    return null;
  }

  return {
    selectedIds: parsed.selectedIds.map((id) => String(id || "").trim()).filter(Boolean),
    reasoning: Array.isArray(parsed.reasoning)
      ? parsed.reasoning.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
  };
}

function normalizeResponseItem(item) {
  return {
    id: item.id,
    title: item.title,
    store: item.store,
    country: item.country,
    gender: item.gender,
    category: item.category,
    styleTags: Array.isArray(item.styleTags) ? item.styleTags : [],
    color: item.color,
    price: item.price,
    currency: item.currency,
    sizeLabel: item.sizeLabel,
    fitTags: Array.isArray(item.fitTags) ? item.fitTags : [],
    bodyTypeTags: Array.isArray(item.bodyTypeTags) ? item.bodyTypeTags : [],
    heightCategoryTags: Array.isArray(item.heightCategoryTags)
      ? item.heightCategoryTags
      : [],
    occasionTags: Array.isArray(item.occasionTags) ? item.occasionTags : [],
    image: item.image,
    buyUrl: getResponseBuyUrl(item),
  };
}

/* -----------------------------
   MAIN HANDLER
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
    const {
      userId,
      profile = {},
      wardrobe = [],
      bodyAnalysis = {},
      filters = {},
      learningMemory = {},
    } = req.body || {};

    const normalizedUserId = normalizeUserId(userId);

    if (!normalizedUserId) {
      return res.status(400).json({
        error: "Missing required field: userId",
        code: "MISSING_USER_ID",
      });
    }

    const todayKey = getTodayKey();
    const plan = getUserPlan(normalizedUserId);
    const limit = getPlanLimit(plan);
    const currentCount = await getUsageCount(normalizedUserId, todayKey);

    if (currentCount >= limit) {
      return res.status(429).json({
        error: "Daily smart shopping limit reached.",
        code: "DAILY_LIMIT_REACHED",
        upgradeRequired: plan === "free",
        remaining: 0,
        limit,
        plan,
        results: [],
        reasoning: [],
      });
    }

    const doNotInclude = ensureStringArray(filters?.doNotInclude).concat(
      ensureStringArray(profile?.doNotInclude)
    );

    const context = {
      profile,
      wardrobe,
      bodyAnalysis,
      filters,
      learningMemory,
    };

    let catalog = MOCK_STORE_CATALOG.filter(
      (item) => !matchesDoNotInclude(item, doNotInclude)
    );

    const selectedStores = normalizeArray(filters?.selectedStores);
    if (selectedStores.length > 0) {
      catalog = catalog.filter((item) =>
        selectedStores.includes(normalizeString(item.store))
      );
    }

    const selectedCategory = normalizeString(filters?.selectedCategory);
    if (selectedCategory) {
      const categoryMatches = catalog.filter(
        (item) => normalizeString(item.category) === selectedCategory
      );
      if (categoryMatches.length > 0) {
        catalog = categoryMatches;
      }
    }

    const scored = catalog
      .map((item) => scoreProduct(item, context))
      .sort((a, b) => b._score - a._score);

    const shortlist = scored.slice(0, AI_SHORTLIST_SIZE);

    let finalRanked = scored;
    let aiReasoning = [];

    try {
      const aiRerank = await rerankWithAi(shortlist, context);

      if (aiRerank?.selectedIds?.length > 0) {
        const selectedSet = new Set(aiRerank.selectedIds);
        const selectedItems = shortlist.filter((item) => selectedSet.has(item.id));
        const remainingItems = scored.filter((item) => !selectedSet.has(item.id));

        finalRanked = [...selectedItems, ...remainingItems];
        aiReasoning = aiRerank.reasoning || [];
      }
    } catch (error) {
      console.log("smart-shopping AI rerank skipped:", error);
    }

    let results = finalRanked.slice(0, Math.max(MIN_RESULTS, AI_FINAL_PICK_COUNT));

    if (results.length < MIN_RESULTS) {
      results = finalRanked.slice(0, MIN_RESULTS);
    }

    const newCount = await incrementUsageCount(normalizedUserId, todayKey);
    const remaining = Math.max(0, limit - newCount);

    const responseReasoning = uniqueList(
      buildReasoning(results, context).concat(aiReasoning)
    ).slice(0, 6);

    return res.status(200).json({
      results: results.map(normalizeResponseItem),
      reasoning: responseReasoning,
      remaining,
      limit,
      plan,
      upgradeRequired: false,
    });
  } catch (error) {
    console.error("smart-shopping error:", error);

    return res.status(500).json({
      error: error?.message || "Smart shopping failed.",
      code: "SMART_SHOPPING_FAILED",
      results: [],
      reasoning: [],
    });
  }
};
