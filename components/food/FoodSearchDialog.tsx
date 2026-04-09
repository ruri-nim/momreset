"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createMealRecord } from "@/lib/food-utils";
import type { FoodSearchItem, MealCategory, MealRecord } from "@/types/food";

interface FoodSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onAddMeal: (meal: MealRecord) => void;
}

export default function FoodSearchDialog({
  open,
  onClose,
  onAddMeal,
}: FoodSearchDialogProps) {
  const mealCategories: MealCategory[] = ["아침", "점심", "저녁", "간식"];
  const [query, setQuery] = useState("");
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [mealCategory, setMealCategory] = useState<MealCategory>("점심");
  const [results, setResults] = useState<FoodSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const helperText = useMemo(() => {
    if (!query.trim()) return "한식 위주로 검색해보세요. 예: 미역국, 계란후라이, 소고기죽";
    if (loading) return "식사 후보를 찾고 있어요.";
    if (errorMessage) return errorMessage;
    if (!results.length) return "검색어에 맞는 결과가 아직 없어요.";
    return `${results.length}개의 음식 후보를 찾았어요.`;
  }, [errorMessage, loading, query, results.length]);

  async function handleSearch() {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error("search_failed");
      }
      const data = (await res.json()) as { results: FoodSearchItem[] };
      setResults(data.results);
    } catch {
      setResults([]);
      setErrorMessage("검색 연결이 잠시 불안정해요. 다시 한 번 시도해보세요.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(item: FoodSearchItem) {
    onAddMeal(createMealRecord(item, portionMultiplier, mealCategory));
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="음식 검색으로 기록하기"
      description="사진이 번거로운 날에도 간단하게 기록할 수 있어요."
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            value={query}
            placeholder="음식 이름을 입력해주세요"
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button onClick={handleSearch}>검색</Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[140px]">
            <span className="mb-2 block text-sm text-muted">식사 시간</span>
            <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
              {mealCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setMealCategory(category)}
                  className="rounded-full border px-3 py-2 text-sm font-medium transition"
                  style={{
                    borderColor:
                      mealCategory === category
                        ? "rgba(16,185,129,0.36)"
                        : "rgb(var(--color-line) / 0.92)",
                    background:
                      mealCategory === category
                        ? "rgba(16,185,129,0.12)"
                        : "var(--card-background-strong)",
                    color:
                      mealCategory === category
                        ? "rgb(var(--color-coral))"
                        : "var(--text-soft)",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <span className="text-sm text-muted">섭취량 배수</span>
          <Input
            className="max-w-28"
            type="number"
            min="0.5"
            max="3"
            step="0.5"
            value={portionMultiplier}
            onChange={(event) => setPortionMultiplier(Number(event.target.value))}
          />
        </div>

        <p className="text-sm text-muted">{helperText}</p>

        <div className="space-y-3">
          {results.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-ink">{item.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge>{item.calories} kcal</Badge>
                  <Badge>{item.protein}g 단백질</Badge>
                  {item.carbs !== undefined ? <Badge>{item.carbs}g 탄수화물</Badge> : null}
                  {item.fat !== undefined ? <Badge>{item.fat}g 지방</Badge> : null}
                </div>
                <p className="mt-2 text-xs text-muted">
                  기준: {item.servingSize ?? "1회분"} · {mealCategory}
                </p>
              </div>
              <Button variant="secondary" onClick={() => handleAdd(item)}>
                추가
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
