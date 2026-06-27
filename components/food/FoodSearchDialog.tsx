"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createMealRecord } from "@/lib/food-utils";
import { calculateCaloriesForGrams, parseServingGrams } from "@/lib/food-calories";
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
  const [mealCategory, setMealCategory] = useState<MealCategory>("점심");
  const [results, setResults] = useState<FoodSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<FoodSearchItem | null>(null);
  const [selectedConsumedGrams, setSelectedConsumedGrams] = useState("");

  const helperText = useMemo(() => {
    if (!query.trim()) return "한식 위주로 검색해보세요. 예: 미역국, 계란후라이, 소고기죽";
    if (loading) return "식사 후보를 찾고 있어요.";
    if (errorMessage) return errorMessage;
    if (!results.length) return "검색어에 맞는 결과가 아직 없어요.";
    return `${results.length}개의 음식 후보를 찾았어요.`;
  }, [errorMessage, loading, query, results.length]);

  async function handleSearch() {
    if (!query.trim()) {
      setResults([]);
      setErrorMessage("음식 이름을 먼저 입력해주세요.");
      return;
    }

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

  function handleStartAdd(item: FoodSearchItem) {
    setSelectedItem(item);
    setSelectedConsumedGrams(String(parseServingGrams(item.servingSize)));
  }

  function handleConfirmAdd() {
    if (!selectedItem) {
      return;
    }

    onAddMeal(
      createMealRecord(
        selectedItem,
        1,
        mealCategory,
        selectedConsumedGrams ? Number(selectedConsumedGrams) : undefined,
      ),
    );
    setSelectedItem(null);
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
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch}>검색</Button>
        </div>

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

        <div className="rounded-2xl bg-peach/70 px-4 py-3 text-sm leading-6 text-muted">
          검색 결과 칼로리는 보통 <span className="font-semibold text-ink">100g / 100mL 또는 1회분 기준</span>이에요.
          원하는 음식을 먼저 고른 뒤, 다음 단계에서 먹은 g을 적어 저장할 수 있어요.
        </div>

        <p className="text-sm text-muted">{helperText}</p>

        {selectedItem ? (
          <div className="rounded-[24px] border border-line bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                  Add detail
                </p>
                <h4 className="mt-2 text-lg font-semibold text-ink">{selectedItem.name}</h4>
                <p className="mt-1 text-xs text-muted">
                  기준 {selectedItem.servingSize ?? "1회분"} · {selectedItem.calories} kcal
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                닫기
              </Button>
            </div>

            <div className="mt-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">섭취량(g)</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={selectedConsumedGrams}
                  onChange={(event) => setSelectedConsumedGrams(event.target.value)}
                  placeholder="예: 180"
                />
              </div>
              </div>

            <div className="mt-4 rounded-2xl bg-peach/70 px-4 py-3 text-sm text-muted">
              {mealCategory}으로 저장되고,
              {` ${calculateCaloriesForGrams(
                selectedItem.calories,
                parseServingGrams(selectedItem.servingSize),
                Number(selectedConsumedGrams),
              )} kcal`}로 기록돼요.
              {selectedConsumedGrams ? ` 섭취량은 ${selectedConsumedGrams}g으로 함께 남아요.` : ""}
            </div>

            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={handleConfirmAdd}>
                확인하고 저장
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedItem(null)}>
                취소
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {results.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-ink">{item.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge>{item.calories} kcal</Badge>
                  <Badge
                    style={{
                      background: "rgb(var(--color-peach) / 0.95)",
                      color: "rgb(var(--color-ink))",
                    }}
                  >
                    기준 {item.servingSize ?? "1회분"}
                  </Badge>
                  <Badge
                    style={{
                      background: "rgb(var(--color-sage) / 0.9)",
                      color: "rgb(var(--color-coral))",
                    }}
                  >
                    추가 전 기준 {item.calories} kcal
                  </Badge>
                  <Badge>{item.protein}g 단백질</Badge>
                  {item.carbs !== undefined ? <Badge>{item.carbs}g 탄수화물</Badge> : null}
                  {item.fat !== undefined ? <Badge>{item.fat}g 지방</Badge> : null}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {mealCategory}으로 기록돼요. 추가를 누른 뒤 먹은 g을 정해 저장할 수 있어요.
                </p>
              </div>
              <Button variant="secondary" onClick={() => handleStartAdd(item)}>
                추가
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
