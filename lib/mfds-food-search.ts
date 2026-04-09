import { mockFoodSearchResults } from "@/lib/mock-data";
import type { FoodSearchItem } from "@/types/food";

const DEFAULT_FOOD_API_KEY =
  "8ceb32d6e436c07b0a87375c0b7a4b8e8816a798ed2dbc740d456d7814e08220";

const RECIPE_API_BASE = "http://openapi.foodsafetykorea.go.kr/api";
const NUTRITION_API_BASE = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02";

const synonymGroups = [
  ["계란", "달걀"],
  ["후라이", "프라이"],
  ["볶음밥", "볶음 밥"],
  ["김치찌개", "김치 찌개"],
  ["된장찌개", "된장 찌개"],
  ["순두부찌개", "순두부 찌개"],
  ["미역국", "미역 국"],
  ["소고기무국", "소고기 무국"],
  ["떡국", "떡 국"],
  ["닭볶음탕", "닭도리탕"],
  ["수육", "보쌈"],
] as const;

function getApiKey() {
  return process.env.MFDS_API_KEY ?? DEFAULT_FOOD_API_KEY;
}

function toNumber(value: unknown) {
  const normalized = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function decodeXmlText(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getXmlTagValue(row: string, tagName: string) {
  const match = row.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  return match ? decodeXmlText(match[1]).trim() : undefined;
}

function inferHydrationFriendly(name: string) {
  return /(국|탕|찌개|죽|스프|전골|미음|수프)/.test(name);
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function buildSearchVariants(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const compact = trimmed.replace(/\s+/g, "");
  const spaced = compact
    .replace(/찌개/g, " 찌개")
    .replace(/국/g, " 국")
    .replace(/탕/g, " 탕")
    .replace(/볶음밥/g, " 볶음밥")
    .trim();

  let variants = [trimmed, compact, spaced];

  for (const group of synonymGroups) {
    const nextVariants: string[] = [];

    for (const variant of variants) {
      let replaced = false;

      for (const synonym of group) {
        if (variant.includes(synonym)) {
          replaced = true;
          for (const candidate of group) {
            nextVariants.push(variant.replaceAll(synonym, candidate));
          }
        }
      }

      if (!replaced) {
        nextVariants.push(variant);
      }
    }

    variants = unique(nextVariants);
  }

  return unique(
    variants
      .map((variant) => variant.trim())
      .filter(Boolean)
      .sort((left, right) => left.length - right.length),
  ).slice(0, 8);
}

function parseRecipeXml(xml: string) {
  const rows = [...xml.matchAll(/<row>([\s\S]*?)<\/row>/gi)];

  return rows
    .map((match) => {
      const row = match[1];
      const name = getXmlTagValue(row, "RCP_NM") ?? "";

      return name
        ? {
            id: `recipe-${name}`,
            name,
            hydrationFriendly: inferHydrationFriendly(name),
          }
        : null;
    })
    .filter(Boolean) as Array<Pick<FoodSearchItem, "id" | "name" | "hydrationFriendly">>;
}

function normalizeNutritionItems(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const response =
    data.response && typeof data.response === "object"
      ? (data.response as Record<string, unknown>)
      : undefined;
  const body = (
    data.body ??
    (response?.body as Record<string, unknown> | undefined) ??
    data.FoodNtrCpntDbInfo02
  ) as Record<string, unknown> | undefined;

  if (!body) {
    return [];
  }

  const items = body.items as
    | Record<string, unknown>[]
    | { item?: Record<string, unknown>[] | Record<string, unknown> }
    | undefined;

  if (Array.isArray(items)) {
    return items;
  }

  if (items && typeof items === "object" && "item" in items) {
    const item = items.item;
    return Array.isArray(item) ? item : item ? [item] : [];
  }

  return [];
}

function getServingSizeLabel(item: Record<string, unknown>) {
  const raw =
    item.SERVING_SIZE ??
    item.SERV_SIZE ??
    item.SERVING_UNIT ??
    item.Z10500 ??
    item.ONE_SERVING_SIZE;

  if (!raw) {
    return "1회분";
  }

  return String(raw).trim();
}

function mapNutritionItem(item: Record<string, unknown>): FoodSearchItem | null {
  const name = String(item.FOOD_NM_KR ?? item.DESC_KOR ?? "").trim();
  if (!name) {
    return null;
  }

  return {
    id: `nutrition-${name}`,
    name,
    calories:
      toNumber(item.AMT_NUM1) ??
      toNumber(item.ENERC) ??
      toNumber(item.ENERC_KCAL) ??
      0,
    protein:
      toNumber(item.AMT_NUM3) ??
      toNumber(item.PROT) ??
      toNumber(item.PROTEIN_G) ??
      0,
    carbs:
      toNumber(item.AMT_NUM6) ??
      toNumber(item.CHOCDF) ??
      toNumber(item.CARBOHYDRATE_G),
    fat:
      toNumber(item.AMT_NUM7) ??
      toNumber(item.FATCE) ??
      toNumber(item.FAT_G),
    servingSize: getServingSizeLabel(item),
    hydrationFriendly: inferHydrationFriendly(name),
  };
}

async function fetchRecipeMatches(query: string) {
  const url = `${RECIPE_API_BASE}/${getApiKey()}/COOKRCP01/xml/1/15/RCP_NM=${encodeURIComponent(query)}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Recipe API request failed: ${response.status}`);
  }

  return parseRecipeXml(await response.text());
}

async function fetchNutritionMatches(query: string) {
  const serviceKey = encodeURIComponent(getApiKey());
  const params = `serviceKey=${serviceKey}&pageNo=1&numOfRows=15&type=json&FOOD_NM_KR=${encodeURIComponent(query)}`;
  const urls = [
    `${NUTRITION_API_BASE}/getFoodNtrCpntDbInq02?${params}`,
    `${NUTRITION_API_BASE}?${params}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as unknown;
      const items = normalizeNutritionItems(payload)
        .map(mapNutritionItem)
        .filter(Boolean) as FoodSearchItem[];

      if (items.length) {
        return items;
      }
    } catch {
      continue;
    }
  }

  return [];
}

function mergeFoodResults(
  recipeItems: Array<Pick<FoodSearchItem, "id" | "name" | "hydrationFriendly">>,
  nutritionItems: FoodSearchItem[],
) {
  const byName = new Map<string, FoodSearchItem>();

  for (const item of nutritionItems) {
    byName.set(item.name, item);
  }

  for (const item of recipeItems) {
    const existing = byName.get(item.name);
    if (existing) {
      byName.set(item.name, {
        ...existing,
        hydrationFriendly: existing.hydrationFriendly || item.hydrationFriendly,
      });
      continue;
    }

    byName.set(item.name, {
      id: item.id,
      name: item.name,
      calories: 0,
      protein: 0,
      carbs: undefined,
      fat: undefined,
      servingSize: "레시피 기준",
      hydrationFriendly: item.hydrationFriendly,
    });
  }

  return [...byName.values()].slice(0, 15);
}

function scoreFoodMatch(itemName: string, queryVariants: string[]) {
  const compactName = itemName.replace(/\s+/g, "");

  return queryVariants.reduce((score, variant) => {
    const compactVariant = variant.replace(/\s+/g, "");
    if (itemName === variant || compactName === compactVariant) {
      return Math.max(score, 120);
    }
    if (itemName.startsWith(variant) || compactName.startsWith(compactVariant)) {
      return Math.max(score, 95);
    }
    if (itemName.includes(variant) || compactName.includes(compactVariant)) {
      return Math.max(score, 75);
    }
    return score;
  }, 0);
}

export async function searchMfdsFoods(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return mockFoodSearchResults.slice(0, 8);
  }

  const queryVariants = buildSearchVariants(normalizedQuery);

  try {
    const recipeResultSets = await Promise.all(queryVariants.map(fetchRecipeMatches));
    const nutritionResultSets = await Promise.all(queryVariants.map(fetchNutritionMatches));
    const recipeItems = recipeResultSets.flat();
    const nutritionItems = nutritionResultSets.flat();

    const merged = mergeFoodResults(recipeItems, nutritionItems)
      .map((item) => ({
        ...item,
        matchScore: scoreFoodMatch(item.name, queryVariants),
      }))
      .filter((item) => item.matchScore > 0)
      .sort((left, right) => right.matchScore - left.matchScore)
      .map(({ matchScore: _matchScore, ...item }) => item);

    if (merged.length) {
      return merged;
    }
  } catch {
    // Fall back to mock data below.
  }

  return mockFoodSearchResults.filter((food) =>
    queryVariants.some((variant) => food.name.includes(variant) || variant.includes(food.name)),
  );
}
