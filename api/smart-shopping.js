const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const FREE_DAILY_LIMIT = 50;
const PRO_DAILY_LIMIT = 1000;
const MIN_RESULTS = 20;

/**
 * Local fallback only.
 * This is useful during local development if KV is not configured.
 * On real Vercel production deployments, you should configure KV so limits persist.
 */
const memoryStore = global.__stylesyncShoppingStore || new Map();
global.__stylesyncShoppingStore = memoryStore;

const CATALOG_IMAGE_OVERRIDES = {
  "zara-women-structured-cream-blazer":
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
  "hm-women-high-waist-black-trousers":
    "https://images.unsplash.com/photo-1506629905607-d9b1a3b2f16b?auto=format&fit=crop&w=900&q=80",
  "asos-women-satin-midi-skirt":
    "https://images.unsplash.com/photo-1583496661160-fb5886a13d57?auto=format&fit=crop&w=900&q=80",
  "zalando-women-cropped-tweed-jacket":
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "mango-women-wide-leg-trousers":
    "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
  "sezane-women-knit-top":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  "revolve-women-wrap-dress":
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  "nordstrom-women-longline-coat":
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  "asos-women-monochrome-set-top":
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  "zara-women-straight-denim":
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
  "selfridges-women-occasion-heels":
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
  "theiconic-women-oversized-shirt":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  "hm-men-tailored-navy-blazer":
    "https://images.unsplash.com/photo-1593032465171-8bd9f97ff1e1?auto=format&fit=crop&w=900&q=80",
  "zara-men-straight-trousers":
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
  "asos-men-overshirt":
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  "mango-men-lightweight-knit":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  "nordstrom-men-long-coat":
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
  "zalando-men-smart-sneakers":
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
};

const STORE_CATALOG = [
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
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
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
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
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
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
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
    bodyTypeTags: [
      "pear",
      "apple",
      "hourglass",
      "rectangle",
      "inverted triangle",
    ],
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
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
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

function getCatalogImage(item) {
  if (CATALOG_IMAGE_OVERRIDES[item.id]) {
    return CATALOG_IMAGE_OVERRIDES[item.id];
  }

  return item.image;
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
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

function getLearningMemoryTtlSeconds() {
  return 60 * 60 * 24 * 180;
}

function normalizeString(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeUserId(userId) {
  return String(userId || "").trim();
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeString(item)).filter(Boolean);
}

function uniqueList(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function toNumber(value) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;

  const cleaned = String(value || "")
    .replace(/[^0-9.]/g, "")
    .trim();

  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
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

function getLearningMemoryKey(userId) {
  return `smart-shopping-learning:${userId}`;
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

function getPreferredStores(profile) {
  const fromArray = normalizeList(profile?.preferredStores);
  if (fromArray.length > 0) return fromArray;

  const single = normalizeString(profile?.preferredStore);
  return single ? [single] : [];
}

function getDoNotInclude(profile, filters) {
  const fromProfile = normalizeList(
    profile?.doNotInclude || profile?.excludedPreferences
  );
  const fromFilters = normalizeList(filters?.doNotInclude);
  return uniqueList([...fromProfile, ...fromFilters]);
}

function getWardrobeColors(wardrobe) {
  if (!Array.isArray(wardrobe)) return [];
  return [
    ...new Set(
      wardrobe.map((item) => normalizeString(item?.color)).filter(Boolean)
    ),
  ];
}

function getWardrobeCategories(wardrobe) {
  if (!Array.isArray(wardrobe)) return [];
  return [
    ...new Set(
      wardrobe.map((item) => normalizeString(item?.category)).filter(Boolean)
    ),
  ];
}

function buildGapCategoryHints(wardrobe) {
  const categories = getWardrobeCategories(wardrobe);
  const possible = ["top", "bottom", "dress", "shoes", "jacket", "accessory"];
  return possible.filter((item) => !categories.includes(item));
}

function normalizeLearningMemory(learningMemory) {
  const memory = learningMemory || {};
  const recentlyUsedFilters = memory?.recentlyUsedFilters || {};
  const savedShoppingLooks = Array.isArray(memory?.savedShoppingLooks)
    ? memory.savedShoppingLooks.map((look) => ({
        id: String(look?.id || "").trim(),
        title: String(look?.title || "").trim(),
        itemIds: normalizeList(look?.itemIds),
        categories: normalizeList(look?.categories),
        colors: normalizeList(look?.colors),
        stores: normalizeList(look?.stores),
        itemCount:
          typeof look?.itemCount === "number"
            ? look.itemCount
            : normalizeList(look?.itemIds).length,
        createdAt: String(look?.createdAt || "").trim(),
      }))
    : [];

  return {
    likedItemIds: normalizeList(memory?.likedItemIds),
    dislikedItemIds: normalizeList(memory?.dislikedItemIds),
    likedStores: normalizeList(memory?.likedStores),
    dislikedStores: normalizeList(memory?.dislikedStores),
    likedColors: normalizeList(memory?.likedColors),
    dislikedColors: normalizeList(memory?.dislikedColors),
    likedCategories: normalizeList(memory?.likedCategories),
    dislikedCategories: normalizeList(memory?.dislikedCategories),
    recentlyUsedFilters: {
      selectedCategory: normalizeString(recentlyUsedFilters?.selectedCategory),
      selectedOccasion: normalizeString(recentlyUsedFilters?.selectedOccasion),
      selectedStores: normalizeList(recentlyUsedFilters?.selectedStores),
      minBudget: toNumber(recentlyUsedFilters?.minBudget),
      maxBudget: toNumber(recentlyUsedFilters?.maxBudget),
    },
    savedShoppingLooks,
  };
}

function mergeSavedShoppingLooks(existingLooks, incomingLooks) {
  const map = new Map();

  [...(existingLooks || []), ...(incomingLooks || [])].forEach((look) => {
    const id = String(look?.id || "").trim();
    const title = String(look?.title || "").trim();
    const key = id || title || `look-${map.size + 1}`;
    if (!key) return;

    const previous = map.get(key);

    map.set(key, {
      id,
      title,
      itemIds: uniqueList([
        ...(previous?.itemIds || []),
        ...normalizeList(look?.itemIds),
      ]),
      categories: uniqueList([
        ...(previous?.categories || []),
        ...normalizeList(look?.categories),
      ]),
      colors: uniqueList([
        ...(previous?.colors || []),
        ...normalizeList(look?.colors),
      ]),
      stores: uniqueList([
        ...(previous?.stores || []),
        ...normalizeList(look?.stores),
      ]),
      itemCount:
        typeof look?.itemCount === "number"
          ? look.itemCount
          : previous?.itemCount || normalizeList(look?.itemIds).length,
      createdAt:
        String(look?.createdAt || "").trim() ||
        String(previous?.createdAt || "").trim(),
    });
  });

  return Array.from(map.values()).slice(0, 30);
}

function mergeLearningMemory(existingMemory, incomingMemory) {
  const a = normalizeLearningMemory(existingMemory);
  const b = normalizeLearningMemory(incomingMemory);

  const selectedStores = uniqueList([
    ...(a.recentlyUsedFilters?.selectedStores || []),
    ...(b.recentlyUsedFilters?.selectedStores || []),
  ]).slice(-8);

  return {
    likedItemIds: uniqueList([...a.likedItemIds, ...b.likedItemIds]).slice(-200),
    dislikedItemIds: uniqueList([...a.dislikedItemIds, ...b.dislikedItemIds]).slice(
      -200
    ),
    likedStores: uniqueList([...a.likedStores, ...b.likedStores]).slice(-30),
    dislikedStores: uniqueList([...a.dislikedStores, ...b.dislikedStores]).slice(-30),
    likedColors: uniqueList([...a.likedColors, ...b.likedColors]).slice(-40),
    dislikedColors: uniqueList([...a.dislikedColors, ...b.dislikedColors]).slice(-40),
    likedCategories: uniqueList([...a.likedCategories, ...b.likedCategories]).slice(
      -20
    ),
    dislikedCategories: uniqueList([
      ...a.dislikedCategories,
      ...b.dislikedCategories,
    ]).slice(-20),
    recentlyUsedFilters: {
      selectedCategory:
        b.recentlyUsedFilters?.selectedCategory ||
        a.recentlyUsedFilters?.selectedCategory ||
        "",
      selectedOccasion:
        b.recentlyUsedFilters?.selectedOccasion ||
        a.recentlyUsedFilters?.selectedOccasion ||
        "",
      selectedStores,
      minBudget:
        b.recentlyUsedFilters?.minBudget !== null &&
        b.recentlyUsedFilters?.minBudget !== undefined
          ? b.recentlyUsedFilters.minBudget
          : a.recentlyUsedFilters?.minBudget ?? null,
      maxBudget:
        b.recentlyUsedFilters?.maxBudget !== null &&
        b.recentlyUsedFilters?.maxBudget !== undefined
          ? b.recentlyUsedFilters.maxBudget
          : a.recentlyUsedFilters?.maxBudget ?? null,
    },
    savedShoppingLooks: mergeSavedShoppingLooks(
      a.savedShoppingLooks,
      b.savedShoppingLooks
    ),
  };
}

async function getStoredLearningMemory(userId) {
  const key = getLearningMemoryKey(userId);
  const kv = await getKvClient();

  if (kv) {
    const value = await kv.get(key);
    return normalizeLearningMemory(value || {});
  }

  const value = memoryStore.get(key);
  return normalizeLearningMemory(value || {});
}

async function saveStoredLearningMemory(userId, learningMemory) {
  const key = getLearningMemoryKey(userId);
  const normalized = normalizeLearningMemory(learningMemory);
  const kv = await getKvClient();

  if (kv) {
    await kv.set(key, normalized, { ex: getLearningMemoryTtlSeconds() });
    return;
  }

  memoryStore.set(key, normalized);
}

function matchesDoNotInclude(item, blockedTerms) {
  if (!blockedTerms || blockedTerms.length === 0) return false;

  const searchableValues = [
    normalizeString(item?.title),
    normalizeString(item?.store),
    normalizeString(item?.category),
    normalizeString(item?.color),
    ...normalizeList(item?.styleTags),
    ...normalizeList(item?.fitTags),
  ];

  return blockedTerms.some((term) => {
    const normalizedTerm = normalizeString(term);
    if (!normalizedTerm) return false;

    return searchableValues.some(
      (value) => value && value.includes(normalizedTerm)
    );
  });
}

function scoreCatalogItem(item, context) {
  let score = 0;

  const itemId = normalizeString(item.id);
  const itemStore = normalizeString(item.store);
  const itemCategory = normalizeString(item.category);
  const itemColor = normalizeString(item.color);
  const itemCurrency = normalizeString(item.currency);
  const itemCountry = normalizeString(item.country);
  const itemStyleTags = normalizeList(item.styleTags);
  const itemBodyTypeTags = normalizeList(item.bodyTypeTags);
  const itemHeightTags = normalizeList(item.heightCategoryTags);
  const itemOccasionTags = normalizeList(item.occasionTags);

  if (context.userCurrency && itemCurrency === context.userCurrency) score += 35;
  if (context.userCountry && itemCountry === context.userCountry) score += 30;

  if (context.preferredStores.includes(itemStore)) score += 18;
  if (context.selectedStores.includes(itemStore)) score += 24;

  if (
    context.stylePreference &&
    itemStyleTags.includes(context.stylePreference)
  ) {
    score += 22;
  }
  if (context.bodyType && itemBodyTypeTags.includes(context.bodyType)) {
    score += 16;
  }
  if (
    context.heightCategory &&
    itemHeightTags.includes(context.heightCategory)
  ) {
    score += 12;
  }

  if (
    context.selectedOccasion &&
    itemOccasionTags.includes(context.selectedOccasion)
  ) {
    score += 14;
  }

  if (
    !context.selectedOccasion &&
    context.profileOccasion &&
    itemOccasionTags.includes(context.profileOccasion)
  ) {
    score += 8;
  }

  if (context.wardrobeColors.includes(itemColor)) score += 8;
  if (context.missingCategories.includes(itemCategory)) score += 10;

  if (context.learningMemory.likedItemIds.includes(itemId)) score += 120;
  if (context.learningMemory.dislikedItemIds.includes(itemId)) score -= 120;
  if (context.learningMemory.likedStores.includes(itemStore)) score += 24;
  if (context.learningMemory.dislikedStores.includes(itemStore)) score -= 24;
  if (context.learningMemory.likedColors.includes(itemColor)) score += 18;
  if (context.learningMemory.dislikedColors.includes(itemColor)) score -= 18;
  if (context.learningMemory.likedCategories.includes(itemCategory)) score += 18;
  if (context.learningMemory.dislikedCategories.includes(itemCategory)) score -= 18;

  const savedLooks = context.learningMemory.savedShoppingLooks || [];
  for (const look of savedLooks) {
    if (look.categories.includes(itemCategory)) score += 8;
    if (look.colors.includes(itemColor)) score += 8;
    if (look.stores.includes(itemStore)) score += 8;
  }

  return score;
}

function buildContext(profile, filters, wardrobe, learningMemory) {
  return {
    gender: normalizeString(profile?.gender),
    country: normalizeString(profile?.country),
    currency: normalizeString(filters?.currency || profile?.currency || ""),
    stylePreference: normalizeString(profile?.stylePreference),
    bodyType: normalizeString(profile?.bodyType),
    heightCategory: normalizeString(profile?.heightCategory),
    selectedCategory: normalizeString(filters?.selectedCategory),
    selectedOccasion: normalizeString(filters?.selectedOccasion),
    profileOccasion: normalizeString(profile?.occasion),
    selectedStores: normalizeList(filters?.selectedStores),
    preferredStores: getPreferredStores(profile),
    minBudget: toNumber(filters?.minBudget),
    maxBudget: toNumber(filters?.maxBudget),
    wardrobeColors: getWardrobeColors(wardrobe),
    missingCategories: buildGapCategoryHints(wardrobe),
    blockedTerms: getDoNotInclude(profile, filters),
    learningMemory,
  };
}

function applyCatalogFilter(item, context, mode) {
  const itemGender = normalizeString(item.gender);
  const itemCountry = normalizeString(item.country);
  const itemCurrency = normalizeString(item.currency);
  const itemStore = normalizeString(item.store);
  const itemCategory = normalizeString(item.category);
  const itemOccasions = normalizeList(item.occasionTags);

  if (context.gender && itemGender !== context.gender) return false;
  if (matchesDoNotInclude(item, context.blockedTerms)) return false;

  if (
    context.selectedStores.length > 0 &&
    !context.selectedStores.includes(itemStore)
  ) {
    return false;
  }

  if (mode === "strict") {
    if (context.country && itemCountry !== context.country) return false;
    if (context.currency && itemCurrency !== context.currency) return false;
    if (
      context.preferredStores.length > 0 &&
      !context.preferredStores.includes(itemStore)
    ) {
      return false;
    }
    if (context.selectedCategory && itemCategory !== context.selectedCategory) {
      return false;
    }
    if (
      context.selectedOccasion &&
      !itemOccasions.includes(context.selectedOccasion)
    ) {
      return false;
    }
    if (context.minBudget !== null && item.price < context.minBudget) {
      return false;
    }
    if (context.maxBudget !== null && item.price > context.maxBudget) {
      return false;
    }
    return true;
  }

  if (mode === "country-currency-relaxed") {
    if (context.country && itemCountry !== context.country) return false;
    if (context.currency && itemCurrency !== context.currency) return false;
    if (context.selectedCategory && itemCategory !== context.selectedCategory) {
      return false;
    }
    if (context.minBudget !== null && item.price < context.minBudget) {
      return false;
    }
    if (context.maxBudget !== null && item.price > context.maxBudget) {
      return false;
    }
    return true;
  }

  if (mode === "currency-relaxed") {
    if (context.currency && itemCurrency !== context.currency) return false;
    if (context.minBudget !== null && item.price < context.minBudget) {
      return false;
    }
    if (context.maxBudget !== null && item.price > context.maxBudget) {
      return false;
    }
    return true;
  }

  if (mode === "budget-relaxed") {
    if (context.currency && itemCurrency !== context.currency) return false;
    return true;
  }

  return true;
}

function buildCatalogShortlist(profile, filters, wardrobe, learningMemory) {
  const context = buildContext(profile, filters, wardrobe, learningMemory);

  const modes = [
    "strict",
    "country-currency-relaxed",
    "currency-relaxed",
    "budget-relaxed",
    "broad",
  ];

  let filtered = [];

  for (const mode of modes) {
    filtered = STORE_CATALOG.filter((item) =>
      applyCatalogFilter(item, context, mode)
    );
    if (filtered.length >= MIN_RESULTS || filtered.length > 0) {
      break;
    }
  }

  return filtered
    .map((item) => {
      const score = scoreCatalogItem(item, {
        preferredStores: context.preferredStores,
        selectedStores: context.selectedStores,
        stylePreference: context.stylePreference,
        bodyType: context.bodyType,
        heightCategory: context.heightCategory,
        selectedOccasion: context.selectedOccasion,
        profileOccasion: context.profileOccasion,
        wardrobeColors: context.wardrobeColors,
        missingCategories: context.missingCategories,
        learningMemory: context.learningMemory,
        userCurrency: context.currency,
        userCountry: context.country,
      });

      return {
        ...item,
        image: getCatalogImage(item),
        rankingScore: score,
        matchSignals: { rankingScore: score },
      };
    })
    .sort((a, b) => b.rankingScore - a.rankingScore);
}

function buildProductContextForPrompt(products) {
  return products.map((item) => ({
    id: item.id,
    title: item.title,
    store: item.store,
    country: item.country,
    gender: item.gender,
    category: item.category,
    styleTags: item.styleTags,
    color: item.color,
    price: item.price,
    currency: item.currency,
    sizeLabel: item.sizeLabel,
    fitTags: item.fitTags,
    bodyTypeTags: item.bodyTypeTags,
    heightCategoryTags: item.heightCategoryTags,
    occasionTags: item.occasionTags,
    rankingScore: item.rankingScore,
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
      if (typeof contentItem?.text === "string" && contentItem.text) {
        return contentItem.text;
      }
    }
  }

  return "";
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
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

async function callOpenAiSmartShopping({
  profile,
  filters,
  wardrobe,
  learningMemory,
  shortlistedProducts,
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  const productContext = buildProductContextForPrompt(shortlistedProducts);

  const systemPrompt = `
You are a premium AI shopping stylist for a fashion app called StyleSync.

You must choose the best exact products from the provided catalog only.

Goals:
- Select products that best suit the user's body type, height category, style preference, gender, budget, preferred stores, country, currency, and occasion.
- Use the style learning memory to adapt recommendations based on likes, dislikes, saved shopping looks, and recent filter behavior.
- Prefer items that feel flattering, wearable, modern, everyday, and polished.
- Avoid extreme or runway-style fashion.
- Never recommend anything that conflicts with the user's doNotInclude preferences.
- Do not invent products.
- Return JSON only.
- Do not wrap JSON in markdown.

Return exactly this JSON shape:
{
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "selectedProductIds": ["product-id-1"]
}

Rules for selectedProductIds:
- Return up to 20 IDs when available.
- Prefer the user's currency when possible.
- Prefer practical variety across categories when possible.
`.trim();

  const userPrompt = `
User profile:
${JSON.stringify(profile || {}, null, 2)}

User filters:
${JSON.stringify(filters || {}, null, 2)}

Saved wardrobe:
${JSON.stringify(wardrobe || {}, null, 2)}

Style learning memory:
${JSON.stringify(learningMemory || {}, null, 2)}

Available product catalog shortlist:
${JSON.stringify(productContext, null, 2)}
`.trim();

  const requestBody = {
    model: process.env.OPENAI_SMART_SHOPPING_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ],
  };

  const openAiResponse = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await openAiResponse.json();

  if (!openAiResponse.ok) {
    const message =
      data?.error?.message || "OpenAI smart shopping request failed.";
    throw new Error(message);
  }

  const rawText = extractOutputText(data);
  const parsed = extractJsonObject(rawText);

  if (!parsed) {
    throw new Error("OpenAI returned an unexpected smart shopping format.");
  }

  const selectedProductIds = Array.isArray(parsed.selectedProductIds)
    ? uniqueList(
        parsed.selectedProductIds
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      ).slice(0, MIN_RESULTS)
    : [];

  const reasoning = Array.isArray(parsed.reasoning)
    ? parsed.reasoning
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return { selectedProductIds, reasoning };
}

function buildFallbackSelection(shortlistedProducts, count = MIN_RESULTS) {
  return shortlistedProducts.slice(0, count).map((item) => item.id);
}

function isWeakStoreUrl(url) {
  const normalized = String(url || "").trim().toLowerCase();
  if (!normalized.startsWith("http")) return true;

  return (
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
    normalized.includes("/new-in") ||
    normalized.includes("/search") ||
    normalized.includes("search?") ||
    normalized.includes("query=")
  );
}

function getCountrySearchHint(country) {
  const normalized = normalizeString(country);
  if (normalized === "nl") return "Netherlands";
  if (normalized === "uk" || normalized === "gb") return "United Kingdom";
  if (normalized === "us") return "United States";
  if (normalized === "fr") return "France";
  if (normalized === "es") return "Spain";
  if (normalized === "au") return "Australia";
  return country || "";
}

function buildGoogleProductSearchUrl(item) {
  const store = String(item?.store || "").trim();
  const title = String(item?.title || "").trim();
  const color = String(item?.color || "").trim();
  const category = String(item?.category || "").trim();
  const currency = String(item?.currency || "").trim();
  const country = getCountrySearchHint(String(item?.country || "").trim());

  const normalizedStore = normalizeString(store);

  if (normalizedStore.includes("mango")) {
    const mangoQuery = [
      `"${title}"`,
      "Mango",
      color,
      category,
      currency,
      country,
      "buy",
    ]
      .filter(Boolean)
      .join(" ");

    return `https://www.google.com/search?q=${encodeURIComponent(mangoQuery)}`;
  }

  const siteHints = {
    zara: "site:zara.com",
    "h&m": 'site:hm.com OR site:www2.hm.com',
    hm: 'site:hm.com OR site:www2.hm.com',
    asos: "site:asos.com",
    zalando: "site:zalando.nl OR site:zalando.com",
    sezane: "site:sezane.com",
    revolve: "site:revolve.com",
    nordstrom: "site:nordstrom.com",
    selfridges: "site:selfridges.com",
    "the iconic": "site:theiconic.com.au",
  };

  const matchedKey =
    Object.keys(siteHints).find((key) => normalizedStore.includes(key)) || "";

  const searchQuery = [
    matchedKey ? siteHints[matchedKey] : "",
    `"${title}"`,
    store,
    color,
    category,
    currency,
    country,
    "buy",
  ]
    .filter(Boolean)
    .join(" ");

  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

function getResponseBuyUrl(item) {
  if (!isWeakStoreUrl(item?.buyUrl)) {
    return item.buyUrl;
  }

  return buildGoogleProductSearchUrl(item);
}

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
    const { userId, profile, filters, wardrobe, learningMemory } = req.body || {};
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
        error: "Daily smart shopping match limit reached.",
        code: "DAILY_LIMIT_REACHED",
        upgradeRequired: plan === "free",
        remaining: 0,
        limit,
        plan,
        resetDate: todayKey,
      });
    }

    const incomingLearningMemory = normalizeLearningMemory(learningMemory);
    const storedLearningMemory = await getStoredLearningMemory(normalizedUserId);
    const mergedLearningMemory = mergeLearningMemory(
      storedLearningMemory,
      incomingLearningMemory
    );

    const shortlistedProducts = buildCatalogShortlist(
      profile || {},
      filters || {},
      Array.isArray(wardrobe) ? wardrobe : [],
      mergedLearningMemory
    );

    if (shortlistedProducts.length === 0) {
      return res.status(200).json({
        results: [],
        reasoning: ["No matching products were found for the current filters."],
        remaining: limit - currentCount,
        limit,
        plan,
        upgradeRequired: false,
        learningMemory: mergedLearningMemory,
      });
    }

    let selectedProductIds = [];
    let reasoning = [];

    try {
      const aiSelection = await callOpenAiSmartShopping({
        profile: profile || {},
        filters: filters || {},
        wardrobe: Array.isArray(wardrobe) ? wardrobe : [],
        learningMemory: mergedLearningMemory,
        shortlistedProducts,
      });

      selectedProductIds = aiSelection.selectedProductIds;
      reasoning = aiSelection.reasoning;
    } catch (aiError) {
      console.error("smart-shopping AI selection failed:", aiError);
      selectedProductIds = buildFallbackSelection(shortlistedProducts, MIN_RESULTS);
      reasoning = [
        "These pieces were matched using your profile, selected filters, and learned shopping preferences.",
      ];
    }

    if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
      selectedProductIds = buildFallbackSelection(shortlistedProducts, MIN_RESULTS);
    }

    const selectedIdSet = new Set(selectedProductIds);
    let results = shortlistedProducts.filter((item) => selectedIdSet.has(item.id));

    const orderedResults = selectedProductIds
      .map((id) => results.find((item) => item.id === id))
      .filter(Boolean);

    let finalResults =
      orderedResults.length > 0 ? orderedResults : results.slice(0, MIN_RESULTS);

    if (finalResults.length < MIN_RESULTS) {
      const extraItems = shortlistedProducts.filter(
        (item) => !finalResults.some((entry) => entry.id === item.id)
      );
      finalResults = [...finalResults, ...extraItems].slice(0, MIN_RESULTS);
    }

    const autoLearnedMemory = mergeLearningMemory(mergedLearningMemory, {
      likedStores: finalResults
        .slice(0, 5)
        .map((item) => normalizeString(item.store)),
      likedColors: finalResults
        .slice(0, 5)
        .map((item) => normalizeString(item.color)),
      likedCategories: finalResults
        .slice(0, 5)
        .map((item) => normalizeString(item.category)),
      recentlyUsedFilters: {
        selectedCategory: normalizeString(filters?.selectedCategory),
        selectedOccasion: normalizeString(filters?.selectedOccasion),
        selectedStores: normalizeList(filters?.selectedStores),
        minBudget: toNumber(filters?.minBudget),
        maxBudget: toNumber(filters?.maxBudget),
      },
    });

    await saveStoredLearningMemory(normalizedUserId, autoLearnedMemory);

    const newCount = await incrementUsageCount(normalizedUserId, todayKey);
    const remaining = Math.max(0, limit - newCount);

    return res.status(200).json({
      results: finalResults.map((item) => ({
        id: item.id,
        title: item.title,
        store: item.store,
        country: item.country,
        gender: item.gender,
        category: item.category,
        styleTags: item.styleTags,
        color: item.color,
        price: item.price,
        currency: item.currency,
        sizeLabel: item.sizeLabel,
        fitTags: item.fitTags,
        bodyTypeTags: item.bodyTypeTags,
        heightCategoryTags: item.heightCategoryTags,
        occasionTags: item.occasionTags,
        image: getCatalogImage(item),
        buyUrl: getResponseBuyUrl(item),
      })),
      reasoning:
        reasoning.length > 0
          ? reasoning
          : [
              "These pieces were chosen to match your profile, selected filters, and learned shopping preferences.",
            ],
      remaining,
      limit,
      plan,
      upgradeRequired: false,
      learningMemory: autoLearnedMemory,
    });
  } catch (error) {
    console.error("smart-shopping error:", error);

    return res.status(500).json({
      error: error?.message || "Smart shopping failed.",
      code: "SMART_SHOPPING_FAILED",
    });
  }
};
