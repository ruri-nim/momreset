import { commonFoodCatalog } from "@/lib/common-food-catalog";
import { mockFoodSearchResults } from "@/lib/mock-data";
import type { FoodSearchItem } from "@/types/food";

const RECIPE_API_BASE = "https://openapi.foodsafetykorea.go.kr/api";
const NUTRITION_API_BASE = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02";
const RESULT_LIMIT = 20;

const synonymGroups = [
  ["계란", "달걀"], ["후라이", "프라이"], ["김치찌개", "김치 찌개"],
  ["된장찌개", "된장 찌개"], ["순두부찌개", "순두부 찌개"],
  ["미역국", "미역 국"], ["소고기무국", "소고기 무국"],
  ["닭볶음탕", "닭도리탕"], ["수육", "보쌈"],
] as const;

function unique<T>(items: T[]) { return [...new Set(items)]; }
function toNumber(value: unknown) {
  const normalized = typeof value === "string" ? value.replace(/,/g, "").trim() : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}
function positiveNumber(value: unknown) {
  const direct = toNumber(value);
  if (direct && direct > 0) return direct;
  if (typeof value !== "string") return undefined;
  const parsed = toNumber(value.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0]);
  return parsed && parsed > 0 ? parsed : undefined;
}
function buildSearchVariants(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  let variants = [trimmed, trimmed.replace(/\s+/g, "")];
  for (const group of synonymGroups) {
    variants = variants.flatMap((variant) => {
      const matched = group.find((word) => variant.includes(word));
      return matched ? group.map((candidate) => variant.replaceAll(matched, candidate)) : [variant];
    });
  }
  return unique(variants.map((variant) => variant.trim()).filter(Boolean)).slice(0, 8);
}
function decodeXmlText(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
}
function xmlValue(row: string, tag: string) {
  const match = row.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXmlText(match[1]).trim() : undefined;
}
function hydrationFriendly(name: string) { return /(국|탕|찌개|죽|스프|전골|미음|수프)/.test(name); }

function parseRecipeXml(xml: string): FoodSearchItem[] {
  const items: FoodSearchItem[] = [];
  for (const match of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/gi)) {
    const row = match[1];
    const name = xmlValue(row, "RCP_NM") ?? "";
    const servingGrams = positiveNumber(xmlValue(row, "INFO_WGT"));
    if (!name) continue;
    items.push({
      id: `recipe-${name}`, name,
      calories: toNumber(xmlValue(row, "INFO_ENG")) ?? 0,
      protein: toNumber(xmlValue(row, "INFO_PRO")) ?? 0,
      carbs: toNumber(xmlValue(row, "INFO_CAR")), fat: toNumber(xmlValue(row, "INFO_FAT")),
      servingSize: servingGrams ? `${servingGrams}g` : "1인분",
      suggestedServingGrams: servingGrams, suggestedServingLabel: "1인분",
      hydrationFriendly: hydrationFriendly(name),
    });
  }
  return items;
}
function recipeApiKeys() {
  return unique([process.env.FOODSAFETY_API_KEY, process.env.MFDS_API_KEY, "sample"].filter(Boolean) as string[]);
}
async function fetchRecipeMatches(query: string) {
  for (const apiKey of recipeApiKeys()) {
    try {
      const url = `${RECIPE_API_BASE}/${apiKey}/COOKRCP01/xml/1/15/RCP_NM=${encodeURIComponent(query)}`;
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(7000) });
      if (!response.ok) continue;
      const xml = await response.text();
      if (xml.includes("인증키가 유효하지 않습니다")) continue;
      return parseRecipeXml(xml);
    } catch { continue; }
  }
  return [];
}
function nutritionItems(payload: unknown) {
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  const response = data.response && typeof data.response === "object" ? data.response as Record<string, unknown> : undefined;
  const body = (data.body ?? response?.body ?? data.FoodNtrCpntDbInfo02) as Record<string, unknown> | undefined;
  if (!body) return [];
  const items = body.items as Record<string, unknown>[] | { item?: Record<string, unknown>[] | Record<string, unknown> } | undefined;
  if (Array.isArray(items)) return items;
  if (items && "item" in items) return Array.isArray(items.item) ? items.item : items.item ? [items.item] : [];
  return [];
}
function mapNutritionItem(item: Record<string, unknown>): FoodSearchItem | null {
  const rawName = String(item.FOOD_NM_KR ?? item.DESC_KOR ?? "").trim();
  if (!rawName) return null;
  const name = rawName.replace(/_씨 포함_생것$/, " (씨 포함)").replace(/_씨 제거_생것$/, " (씨 제거)").replace(/_생것$/, "").replaceAll("_", " · ");
  const baseGrams = positiveNumber(item.SERVING_SIZE) ?? positiveNumber(item.SERV_SIZE) ?? positiveNumber(item.Z10500) ?? 100;
  const suggestedGrams = positiveNumber(item.DISH_ONE_SERVING) ?? positiveNumber(item.NUTRI_AMOUNT_SERVING) ?? (String(item.DB_GRP_NM ?? "") === "음식" ? positiveNumber(item.Z10500) : undefined);
  return {
    id: `nutrition-${String(item.FOOD_CD ?? rawName)}`, name,
    calories: toNumber(item.AMT_NUM1) ?? toNumber(item.ENERC) ?? 0,
    protein: toNumber(item.AMT_NUM3) ?? toNumber(item.PROT) ?? 0,
    carbs: toNumber(item.AMT_NUM6) ?? toNumber(item.CHOCDF),
    fat: toNumber(item.AMT_NUM4) ?? toNumber(item.FATCE), servingSize: `${baseGrams}g`,
    suggestedServingGrams: suggestedGrams, suggestedServingLabel: suggestedGrams ? "1인분" : undefined,
    hydrationFriendly: hydrationFriendly(rawName),
  };
}
async function fetchNutritionMatches(query: string) {
  const apiKey = process.env.DATA_GO_KR_API_KEY ?? process.env.MFDS_NUTRITION_API_KEY;
  if (!apiKey) return [];
  const params = new URLSearchParams({ serviceKey: apiKey, pageNo: "1", numOfRows: "100", type: "json", FOOD_NM_KR: query });
  const urls = [`${NUTRITION_API_BASE}/getFoodNtrCpntDbInq02?${params}`, `${NUTRITION_API_BASE}?${params}`];
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(7000) });
      if (!response.ok) continue;
      const items = nutritionItems(await response.json()).map(mapNutritionItem).filter((item): item is FoodSearchItem => item !== null);
      if (items.length) return items;
    } catch { continue; }
  }
  return [];
}
function matches(item: FoodSearchItem, variants: string[]) {
  const name = item.name.replace(/\s+/g, "");
  return variants.some((variant) => { const query = variant.replace(/\s+/g, ""); return name.includes(query) || query.includes(name); });
}
function score(item: FoodSearchItem, variants: string[]) {
  const name = item.name.replace(/\s+/g, "");
  return variants.reduce((best, variant) => {
    const query = variant.replace(/\s+/g, "");
    if (name === query) return Math.max(best, 200);
    if (name.startsWith(query)) return Math.max(best, 150);
    if (name.includes(query)) return Math.max(best, 100);
    return best;
  }, 0) - name.length * 0.1;
}
export async function searchMfdsFoods(query: string) {
  const variants = buildSearchVariants(query);
  if (!variants.length) return commonFoodCatalog.slice(0, 8);
  const local = commonFoodCatalog.filter((item) => matches(item, variants));
  const settled = await Promise.allSettled([...variants.map(fetchRecipeMatches), ...variants.map(fetchNutritionMatches)]);
  const remote = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const byName = new Map<string, FoodSearchItem>();
  for (const item of [...local, ...remote]) if (matches(item, variants)) byName.set(item.name, item);
  const results = [...byName.values()].sort((left, right) => score(right, variants) - score(left, variants)).slice(0, RESULT_LIMIT);
  return results.length ? results : mockFoodSearchResults.filter((item) => matches(item, variants));
}
