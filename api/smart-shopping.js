const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const FREE_DAILY_LIMIT = 2;
const PRO_DAILY_LIMIT = 1000;

/**
 * Local fallback only.
 * This is useful during local development if KV is not configured.
 * On real Vercel production deployments, you should configure KV so limits persist.
 */
const memoryStore = global.__stylesyncShoppingStore || new Map();
global.__stylesyncShoppingStore = memoryStore;

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

function toNumber(value) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

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
  const proUserIds = getProUserIds();

  if (proUserIds.includes(userId)) {
    return "pro";
  }

  return "free";
}

function getPlanLimit(plan) {
  if (plan === "pro") {
    return PRO_DAILY_LIMIT;
  }

  return FREE_DAILY_LIMIT;
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

function getPreferredStores(profile) {
  const fromArray = normalizeList(profile?.preferredStores);
  if (fromArray.length > 0) {
    return fromArray;
  }

  const single = normalizeString(profile?.preferredStore);
  return single ? [single] : [];
}

function getWardrobeColors(wardrobe) {
  if (!Array.isArray(wardrobe)) return [];
  const colors = wardrobe
    .map((item) => normalizeString(item?.color))
    .filter(Boolean);

  return [...new Set(colors)];
}

function getWardrobeCategories(wardrobe) {
  if (!Array.isArray(wardrobe)) return [];
  const categories = wardrobe
    .map((item) => normalizeString(item?.category))
    .filter(Boolean);

  return [...new Set(categories)];
}

function buildGapCategoryHints(wardrobe) {
  const categories = getWardrobeCategories(wardrobe);
  const possible = ["top", "bottom", "dress", "shoes", "jacket", "accessory"];
  return possible.filter((item) => !categories.includes(item));
}

function buildCatalogShortlist(profile, filters, wardrobe) {
  const gender = normalizeString(profile?.gender);
  const country = normalizeString(profile?.country);
  const stylePreference = normalizeString(profile?.stylePreference);
  const bodyType = normalizeString(profile?.bodyType);
  const heightCategory = normalizeString(profile?.heightCategory);
  const skinTone = normalizeString(profile?.skinTone);

  const preferredStores = getPreferredStores(profile);
  const selectedStores = normalizeList(filters?.selectedStores);
  const selectedCategory = normalizeString(filters?.selectedCategory);
  const selectedOccasion = normalizeString(filters?.selectedOccasion);
  const minBudget = toNumber(filters?.minBudget);
  const maxBudget = toNumber(filters?.maxBudget);

  const wardrobeColors = getWardrobeColors(wardrobe);
  const missingCategories = buildGapCategoryHints(wardrobe);

  let filtered = STORE_CATALOG.filter((item) => {
    const itemGender = normalizeString(item.gender);
    const itemCountry = normalizeString(item.country);
    const itemStore = normalizeString(item.store);
    const itemCategory = normalizeString(item.category);
    const itemOccasions = normalizeList(item.occasionTags);

    if (gender && itemGender !== gender) return false;
    if (country && itemCountry !== country) return false;
    if (selectedStores.length > 0 && !selectedStores.includes(itemStore)) {
      return false;
    }
    if (selectedCategory && itemCategory !== selectedCategory) return false;
    if (selectedOccasion && !itemOccasions.includes(selectedOccasion)) {
      return false;
    }
    if (minBudget !== null && item.price < minBudget) return false;
    if (maxBudget !== null && item.price > maxBudget) return false;

    return true;
  });

  if (filtered.length === 0) {
    filtered = STORE_CATALOG.filter((item) => {
      const itemGender = normalizeString(item.gender);
      return !gender || itemGender === gender;
    });
  }

  return filtered.map((item) => ({
    ...item,
    matchSignals: {
      preferredStoreMatch: preferredStores.includes(normalizeString(item.store)),
      styleMatch: normalizeList(item.styleTags).includes(stylePreference),
      bodyTypeMatch: normalizeList(item.bodyTypeTags).includes(bodyType),
      heightMatch: normalizeList(item.heightCategoryTags).includes(heightCategory),
      wardrobeColorMatch: wardrobeColors.includes(normalizeString(item.color)),
      missingCategoryMatch: missingCategories.includes(normalizeString(item.category)),
      skinToneHint: skinTone,
      selectedOccasion,
      selectedCategory,
    },
  }));
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
    image: item.image,
    buyUrl: item.buyUrl,
    matchSignals: item.matchSignals,
  }));
}

function extractOutputText(apiResponse) {
  if (typeof apiResponse?.output_text === "string" && apiResponse.output_text) {
    return apiResponse.output_text;
  }

  if (!Array.isArray(apiResponse?.output)) {
    return "";
  }

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
    const sliced = text.slice(firstBrace, lastBrace + 1);
    const parsed = safeJsonParse(sliced);
    if (parsed) return parsed;
  }

  return null;
}

async function callOpenAiSmartShopping({
  profile,
  filters,
  wardrobe,
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
- Select products that best suit the user's body type, height category, style preference, gender, budget, preferred stores, country, and occasion.
- Prefer items that feel flattering, wearable, polished, and relevant.
- When useful, prefer items that fill wardrobe gaps or coordinate with wardrobe colors.
- Do not invent products.
- Return JSON only.
- Do not wrap JSON in markdown.

Return exactly this JSON shape:
{
  "reasoning": [
    "reason 1",
    "reason 2",
    "reason 3"
  ],
  "selectedProductIds": [
    "product-id-1",
    "product-id-2",
    "product-id-3",
    "product-id-4",
    "product-id-5",
    "product-id-6"
  ]
}
`.trim();

  const userPrompt = `
User profile:
${JSON.stringify(profile || {}, null, 2)}

User filters:
${JSON.stringify(filters || {}, null, 2)}

Saved wardrobe:
${JSON.stringify(wardrobe || [], null, 2)}

Available product catalog shortlist:
${JSON.stringify(productContext, null, 2)}

Please choose the best exact products from the shortlist only.
Prefer 6 product IDs if possible.
Keep reasoning short, practical, and specific.
`.trim();

  const requestBody = {
    model: process.env.OPENAI_SMART_SHOPPING_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: systemPrompt,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: userPrompt,
          },
        ],
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
    ? parsed.selectedProductIds
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];

  const reasoning = Array.isArray(parsed.reasoning)
    ? parsed.reasoning
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    selectedProductIds,
    reasoning,
  };
}

function buildFallbackSelection(shortlistedProducts) {
  return shortlistedProducts.slice(0, 6).map((item) => item.id);
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
    const { userId, profile, filters, wardrobe } = req.body || {};

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

    const shortlistedProducts = buildCatalogShortlist(
      profile || {},
      filters || {},
      Array.isArray(wardrobe) ? wardrobe : []
    );

    if (shortlistedProducts.length === 0) {
      return res.status(200).json({
        results: [],
        reasoning: ["No matching products were found for the current filters."],
        remaining: limit - currentCount,
        limit,
        plan,
        upgradeRequired: false,
      });
    }

    let selectedProductIds = [];
    let reasoning = [];

    try {
      const aiSelection = await callOpenAiSmartShopping({
        profile: profile || {},
        filters: filters || {},
        wardrobe: Array.isArray(wardrobe) ? wardrobe : [],
        shortlistedProducts,
      });

      selectedProductIds = aiSelection.selectedProductIds;
      reasoning = aiSelection.reasoning;
    } catch (aiError) {
      console.error("smart-shopping AI selection failed:", aiError);
      selectedProductIds = buildFallbackSelection(shortlistedProducts);
      reasoning = [
        "Using a fallback shopping ranking because the AI selector was temporarily unavailable.",
      ];
    }

    if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
      selectedProductIds = buildFallbackSelection(shortlistedProducts);
    }

    const selectedIdSet = new Set(selectedProductIds);

    let results = shortlistedProducts.filter((item) => selectedIdSet.has(item.id));

    if (results.length === 0) {
      results = shortlistedProducts.slice(0, 6);
    }

    const orderedResults = selectedProductIds
      .map((id) => results.find((item) => item.id === id))
      .filter(Boolean);

    const finalResults =
      orderedResults.length > 0
        ? orderedResults
        : results.slice(0, 6);

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
        image: item.image,
        buyUrl: item.buyUrl,
      })),
      reasoning:
        reasoning.length > 0
          ? reasoning
          : ["These items were chosen to best match the user's saved profile and filters."],
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
    });
  }
};
