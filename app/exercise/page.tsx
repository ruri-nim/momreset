"use client";

import { useEffect, useRef, useState } from "react";
import StatCard from "@/components/common/StatCard";
import { AppShell } from "@/components/diet-app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getDateKeyDaysAgo, getLocalDateKey } from "@/lib/diet-app-date";
import {
  estimateCaloriesByExerciseName,
  exercisePresets,
  findExercisePresetByName,
} from "@/lib/exercise-calories";
import {
  loadBodyWeightKg,
  loadExerciseLogs,
  saveExerciseLogs,
} from "@/lib/diet-app-storage";
import type { ExerciseLogItem } from "@/types/diet-app";

export default function ExercisePage() {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogItem[]>([]);
  const [bodyWeightKg, setBodyWeightKg] = useState("55");
  const [recordOpen, setRecordOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [exerciseCalories, setExerciseCalories] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isManualCalories, setIsManualCalories] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState("");
  const [editingExerciseMinutes, setEditingExerciseMinutes] = useState("");
  const [editingExerciseCalories, setEditingExerciseCalories] = useState("");
  const [editingLoggedAt, setEditingLoggedAt] = useState(getLocalDateKey());
  const hasSkippedInitialSave = useRef(false);

  useEffect(() => {
    setExerciseLogs(loadExerciseLogs());
    setBodyWeightKg(String(loadBodyWeightKg()));
  }, []);

  useEffect(() => {
    if (!hasSkippedInitialSave.current) {
      hasSkippedInitialSave.current = true;
      return;
    }

    saveExerciseLogs(exerciseLogs);
  }, [exerciseLogs]);

  useEffect(() => {
    if (isManualCalories) {
      return;
    }

    const parsedWeight = Number(bodyWeightKg);
    const parsedMinutes = Number(exerciseMinutes);
    const estimatedCalories = estimateCaloriesByExerciseName(
      exerciseName,
      parsedWeight,
      parsedMinutes,
    );

    setExerciseCalories(estimatedCalories ? String(estimatedCalories) : "");
  }, [bodyWeightKg, exerciseMinutes, exerciseName, isManualCalories]);

  const todayKey = getLocalDateKey();
  const todayExerciseLogs = exerciseLogs.filter((item) => item.loggedAt === todayKey);
  const totalMinutes = todayExerciseLogs.reduce((sum, item) => sum + item.minutes, 0);
  const totalBurnedCalories = todayExerciseLogs.reduce(
    (sum, item) => sum + item.burnedCalories,
    0,
  );
  const parsedWeight = Number(bodyWeightKg) || 55;
  const quickExercises = exercisePresets.slice(0, 4).map((preset) => ({
    id: preset.id,
    name: preset.name,
    minutes: preset.defaultMinutes,
    burnedCalories: estimateCaloriesByExerciseName(
      preset.name,
      parsedWeight,
      preset.defaultMinutes,
    ),
  }));

  const handleQuickAdd = (item: {
    id: string;
    name: string;
    minutes: number;
    burnedCalories: number;
  }) => {
    const nextItem: ExerciseLogItem = {
      id: crypto.randomUUID(),
      name: item.name,
      minutes: item.minutes,
      burnedCalories: item.burnedCalories,
      loggedAt: todayKey,
    };

    setExerciseLogs((prev) => [nextItem, ...prev]);
  };

  const handleDelete = (id: string) => {
    setExerciseLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStartEdit = (item: ExerciseLogItem) => {
    setEditingExerciseId(item.id);
    setEditingExerciseName(item.name);
    setEditingExerciseMinutes(String(item.minutes));
    setEditingExerciseCalories(String(item.burnedCalories));
    setEditingLoggedAt(item.loggedAt ?? todayKey);
  };

  const handleCloseEdit = () => {
    setEditingExerciseId(null);
    setEditingExerciseName("");
    setEditingExerciseMinutes("");
    setEditingExerciseCalories("");
    setEditingLoggedAt(todayKey);
  };

  const handleSaveEdit = () => {
    if (
      !editingExerciseId ||
      !editingExerciseName ||
      !editingExerciseMinutes ||
      !editingLoggedAt
    ) {
      return;
    }

    setExerciseLogs((prev) =>
      prev.map((item) =>
        item.id === editingExerciseId
          ? {
              ...item,
              name: editingExerciseName,
              minutes: Number(editingExerciseMinutes),
              burnedCalories: Number(editingExerciseCalories || 0),
              loggedAt: editingLoggedAt,
            }
          : item,
      ),
    );
    handleCloseEdit();
  };

  const resetRecordDialog = () => {
    setExerciseName("");
    setExerciseMinutes("");
    setExerciseCalories("");
    setSelectedPresetId(null);
    setIsManualCalories(false);
    setRecordOpen(false);
  };

  const handlePresetPick = (presetId: string) => {
    const preset = exercisePresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setSelectedPresetId(preset.id);
    setExerciseName(preset.name);
    setExerciseMinutes(String(preset.defaultMinutes));
    setIsManualCalories(false);
    setExerciseCalories(
      String(
        estimateCaloriesByExerciseName(preset.name, Number(bodyWeightKg), preset.defaultMinutes),
      ),
    );
  };

  const handleSaveRecord = () => {
    if (!exerciseName || !exerciseMinutes) {
      alert("운동 이름과 시간을 입력해주세요.");
      return;
    }

    const nextItem: ExerciseLogItem = {
      id: crypto.randomUUID(),
      name: exerciseName,
      minutes: Number(exerciseMinutes),
      burnedCalories: Number(exerciseCalories || 0),
      loggedAt: todayKey,
    };

    setExerciseLogs((prev) => [nextItem, ...prev]);
    resetRecordDialog();
  };

  return (
    <AppShell
      eyebrow="Exercise bonus"
      title="Exercise"
      description="오늘 움직인 만큼 가볍게 기록해보세요."
    >
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Today log
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{totalBurnedCalories} kcal</h2>
        <p className="mt-1 text-sm text-muted">
          오늘 총 {totalMinutes}분 움직였고, 운동 기록은 {todayExerciseLogs.length}개예요
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge>{todayExerciseLogs.length ? "오늘 Bonus 획득" : "아직 운동 기록 전"}</Badge>
        <Badge
          style={{ background: "rgb(var(--color-peach) / 0.95)", color: "rgb(var(--color-ink))" }}
        >
          총 {totalMinutes}분 움직임
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="운동 시간" value={`${totalMinutes}분`} helper="기록 기준" accent="sage" />
        <StatCard
          label="소모 칼로리"
          value={`${totalBurnedCalories} kcal`}
          helper={`${parsedWeight}kg 설정 기준`}
          accent="neutral"
        />
      </div>

      <Card>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Today exercise
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">오늘 운동</h2>
            <p className="mt-1 text-sm text-muted">
              오늘 한 운동을 바로 추가해보세요.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setRecordOpen(true)} className="px-5">
            운동 기록하기
          </Button>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Today list
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">오늘의 운동 리스트</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Food처럼 오늘 추가한 운동이 아래에 쌓여서 보여져요.
        </p>
        <div className="mt-4 space-y-3">
          {todayExerciseLogs.length === 0 ? (
            <p className="text-sm text-muted">아직 기록한 운동이 없어요.</p>
          ) : (
            todayExerciseLogs.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[22px] border border-line/80 bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.minutes}분 수행</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-peach px-3 py-1 text-xs font-semibold text-ink">
                    {item.burnedCalories} kcal
                  </div>
                  <Button
                    variant="secondary"
                    className="px-3 py-2 text-xs"
                    onClick={() => handleStartEdit(item)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-2 text-xs"
                    onClick={() => handleDelete(item.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Quick choices
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">빠른 기록 버튼</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          자주 하는 운동은 버튼 한 번으로 바로 기록할 수 있어요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickExercises.map((item) => (
            <Button
              key={item.id}
              variant="secondary"
              onClick={() => handleQuickAdd(item)}
            >
              {item.name} · {item.minutes}분 · {item.burnedCalories}kcal
            </Button>
          ))}
        </div>
      </Card>

      <Dialog
        open={recordOpen}
        onClose={resetRecordDialog}
        title="운동 기록하기"
        description="운동 이름과 시간을 입력해 기록해보세요."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">운동 종류</label>
            <div className="flex flex-wrap gap-2">
              {exercisePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetPick(preset.id)}
                  className="rounded-full border px-3 py-2 text-sm font-semibold transition"
                  style={{
                    borderColor:
                      selectedPresetId === preset.id
                        ? "rgba(16,185,129,0.36)"
                        : "rgb(var(--color-line) / 0.92)",
                    background:
                      selectedPresetId === preset.id
                        ? "rgba(16,185,129,0.12)"
                        : "var(--card-background-strong)",
                    color:
                      selectedPresetId === preset.id
                        ? "rgb(var(--color-coral))"
                        : "rgb(var(--color-muted))",
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="exerciseName" className="mb-2 block text-sm font-semibold text-ink">
              운동 이름
            </label>
            <Input
              id="exerciseName"
              value={exerciseName}
              onChange={(event) => {
                const nextName = event.target.value;
                setExerciseName(nextName);
                setSelectedPresetId(findExercisePresetByName(nextName)?.id ?? null);
                setIsManualCalories(false);
              }}
              placeholder="예: 빠른 걷기"
            />
          </div>

          <div>
            <label
              htmlFor="exerciseMinutes"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              운동 시간(분)
            </label>
            <Input
              id="exerciseMinutes"
              type="number"
              value={exerciseMinutes}
              onChange={(event) => {
                setExerciseMinutes(event.target.value);
                setIsManualCalories(false);
              }}
              placeholder="예: 25"
            />
          </div>

          <div>
            <label
              htmlFor="exerciseCalories"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              소모 칼로리
            </label>
            <Input
              id="exerciseCalories"
              type="number"
              value={exerciseCalories}
              onChange={(event) => {
                setExerciseCalories(event.target.value);
                setIsManualCalories(true);
              }}
              placeholder="자동 계산"
            />
            <p className="mt-2 text-xs leading-5 text-muted">
              {isManualCalories
                ? "직접 수정한 값이에요. 운동 이름이나 시간을 바꾸면 다시 자동 계산할 수 있어요."
                : "현재 몸무게와 운동 시간 기준으로 자동 계산된 값이에요."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsManualCalories(false);
                  setExerciseCalories(
                    String(
                      estimateCaloriesByExerciseName(
                        exerciseName,
                        Number(bodyWeightKg),
                        Number(exerciseMinutes),
                      ),
                    ),
                  );
                }}
              >
                자동 다시 계산
              </Button>
            </div>
          </div>

          <Button onClick={handleSaveRecord} className="w-full">
            저장하기
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(editingExerciseId)}
        onClose={handleCloseEdit}
        title="운동 기록 수정"
        description="기록을 다시 고치고 저장할 수 있어요."
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="editingExerciseName"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              운동 이름
            </label>
            <Input
              id="editingExerciseName"
              value={editingExerciseName}
              onChange={(event) => setEditingExerciseName(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="editingExerciseMinutes"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              운동 시간(분)
            </label>
            <Input
              id="editingExerciseMinutes"
              type="number"
              value={editingExerciseMinutes}
              onChange={(event) => setEditingExerciseMinutes(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="editingExerciseCalories"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              소모 칼로리
            </label>
            <Input
              id="editingExerciseCalories"
              type="number"
              value={editingExerciseCalories}
              onChange={(event) => setEditingExerciseCalories(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="editingExerciseDate"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              기록 날짜
            </label>
            <Input
              id="editingExerciseDate"
              type="date"
              value={editingLoggedAt}
              onChange={(event) => setEditingLoggedAt(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setEditingLoggedAt(getLocalDateKey())}
              >
                오늘
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditingLoggedAt(getDateKeyDaysAgo(1))}
              >
                어제
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} className="flex-1">
              저장
            </Button>
            <Button variant="secondary" onClick={handleCloseEdit} className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </Dialog>
    </AppShell>
  );
}
