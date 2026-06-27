export function parseServingGrams(servingSize?: string) {
  if (!servingSize) {
    return 100;
  }

  const match = servingSize.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(?:g|ml)/i);
  const grams = match ? Number(match[1]) : 100;

  return grams > 0 ? grams : 100;
}

export function calculateCaloriesForGrams(
  baseCalories: number,
  baseServingGrams: number,
  consumedGrams: number,
) {
  if (baseCalories <= 0 || baseServingGrams <= 0 || consumedGrams <= 0) {
    return 0;
  }

  return Math.round((baseCalories * consumedGrams) / baseServingGrams);
}
