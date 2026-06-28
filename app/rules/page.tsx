"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/diet-app/app-shell";
import { CheckRow } from "@/components/diet-app/check-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getLocalDateKey } from "@/lib/diet-app-date";
import {
  DAILYOK_LOCAL_EVENT,
  getRuleHistoryForDate,
  loadAvoidRules,
  loadDoRules,
  loadExerciseLogs,
  loadFoodList,
  loadRuleHistory,
  saveAvoidRules,
  saveDoRules,
  saveRuleStatusesForDate,
} from "@/lib/diet-app-storage";
import {
  getPersonalizedRuleRecommendations,
  getRulePerformanceHighlights,
} from "@/lib/rule-insights";
import { RULE_SUGGESTIONS } from "@/lib/rule-suggestions";
import type {
  DietFoodItem,
  ExerciseLogItem,
  RuleHistoryEntry,
} from "@/types/diet-app";
import type { RuleItem } from "@/types/diet-app";

function hasRuleTitle(items: RuleItem[], title: string) {
  return items.some((item) => item.title === title);
}

function formatWeekLabel(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

export default function RulesPage() {
  const todayKey = getLocalDateKey();
  const [viewDateKey, setViewDateKey] = useState(todayKey);
  const viewDate = new Date(`${viewDateKey}T12:00:00`);
  const isToday = viewDateKey === todayKey;
  const dateLabel = isToday ? "오늘" : `${viewDate.getMonth() + 1}월 ${viewDate.getDate()}일`;
  const weekLabel = formatWeekLabel(viewDate);
  const [doRules, setDoRules] = useState<RuleItem[]>([]);
  const [avoidRules, setAvoidRules] = useState<RuleItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleType, setNewRuleType] = useState<"do" | "avoid">("do");
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [foodList, setFoodList] = useState<DietFoodItem[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogItem[]>([]);
  const [ruleHistory, setRuleHistory] = useState<RuleHistoryEntry[]>([]);
  const isStatusEditor = isEmbedded;

  useEffect(() => {
    const loadData = () => {
      const savedDoRules = loadDoRules();
      const savedAvoidRules = loadAvoidRules();
      const todayHistory = getRuleHistoryForDate(viewDateKey);

      setFoodList(loadFoodList());
      setExerciseLogs(loadExerciseLogs());
      setRuleHistory(loadRuleHistory());
      setDoRules(
        savedDoRules.map((item) => ({
          ...item,
          status: todayHistory?.doRuleStatuses[item.id] ?? "pending",
        })),
      );
      setAvoidRules(
        savedAvoidRules.map((item) => ({
          ...item,
          status: todayHistory?.avoidRuleStatuses[item.id] ?? "pending",
        })),
      );
    };

    loadData();
    const requestedDate = new URLSearchParams(window.location.search).get("date");
    setIsEmbedded(new URLSearchParams(window.location.search).get("embed") === "1");
    if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      setViewDateKey(requestedDate);
    }
    window.addEventListener(DAILYOK_LOCAL_EVENT, loadData);

    return () => {
      window.removeEventListener(DAILYOK_LOCAL_EVENT, loadData);
    };
  }, [viewDateKey]);

  const updateRuleStatus = (
    type: "do" | "avoid",
    id: string,
    status: RuleItem["status"],
  ) => {
    if (type === "do") {
      const next = doRules.map((item) => (item.id === id ? { ...item, status } : item));
      setDoRules(next);
      saveRuleStatusesForDate(viewDateKey, next, avoidRules);
      return;
    }

    const next = avoidRules.map((item) => (item.id === id ? { ...item, status } : item));
    setAvoidRules(next);
    saveRuleStatusesForDate(viewDateKey, doRules, next);
  };

  const deleteRule = (type: "do" | "avoid", id: string) => {
    if (type === "do") {
      const next = doRules.filter((item) => item.id !== id);
      setDoRules(next);
      saveDoRules(next);
      saveRuleStatusesForDate(viewDateKey, next, avoidRules);
      return;
    }

    const next = avoidRules.filter((item) => item.id !== id);
    setAvoidRules(next);
    saveAvoidRules(next);
    saveRuleStatusesForDate(viewDateKey, doRules, next);
  };

  const addRule = () => {
    if (!newRuleTitle.trim()) {
      return;
    }

    if (
      hasRuleTitle(doRules, newRuleTitle.trim()) ||
      hasRuleTitle(avoidRules, newRuleTitle.trim())
    ) {
      setDialogOpen(false);
      setNewRuleTitle("");
      return;
    }

    const nextRule: RuleItem = {
      id: crypto.randomUUID(),
      title: newRuleTitle.trim(),
      status: "pending",
    };

    if (newRuleType === "do") {
      const next = [...doRules, nextRule];
      setDoRules(next);
      saveDoRules(next);
      saveRuleStatusesForDate(viewDateKey, next, avoidRules);
    } else {
      const next = [...avoidRules, nextRule];
      setAvoidRules(next);
      saveAvoidRules(next);
      saveRuleStatusesForDate(viewDateKey, doRules, next);
    }

    setNewRuleTitle("");
    setNewRuleType("do");
    setDialogOpen(false);
  };

  const addSuggestion = (title: string, type: "do" | "avoid") => {
    if (hasRuleTitle(doRules, title) || hasRuleTitle(avoidRules, title)) {
      return;
    }

    const nextRule: RuleItem = {
      id: crypto.randomUUID(),
      title,
      status: "pending",
    };

    if (type === "avoid") {
      const next = [...avoidRules, nextRule];
      setAvoidRules(next);
      saveAvoidRules(next);
      saveRuleStatusesForDate(viewDateKey, doRules, next);
      return;
    }

    const next = [...doRules, nextRule];
    setDoRules(next);
    saveDoRules(next);
    saveRuleStatusesForDate(viewDateKey, next, avoidRules);
  };

  const performance = getRulePerformanceHighlights({
    doRules,
    avoidRules,
    history: ruleHistory,
  });
  const personalized = getPersonalizedRuleRecommendations({
    foods: foodList,
    exerciseLogs,
    ruleHistory,
    doRules,
    avoidRules,
  });
  const availableSuggestions = RULE_SUGGESTIONS.filter(
    (item) => !hasRuleTitle(doRules, item.title) && !hasRuleTitle(avoidRules, item.title),
  );

  return (
    <AppShell
      eyebrow="Weekly rules"
      title="Rules"
      description={
        isStatusEditor
          ? `${dateLabel} 규칙의 성공과 실패를 기록해보세요.`
          : "이번 주 규칙을 확인하고 추가하거나 삭제해보세요."
      }
      embedded={isEmbedded}
    >
      <div className="flex flex-wrap gap-2">
        {isStatusEditor ? <Badge>{dateLabel} 기록 수정 중</Badge> : null}
        <Badge>해야 할 일 {doRules.length}개</Badge>
        <Badge
          style={{ background: "rgb(var(--color-peach) / 0.95)", color: "rgb(var(--color-ink))" }}
        >
          피해야 할 일 {avoidRules.length}개
        </Badge>
      </div>

      {!isStatusEditor ? <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          This week
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{weekLabel}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          너무 많지 않게, 내가 지킬 수 있는 기준으로 정하면 좋아요.
        </p>
      </Card> : null}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Do list
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">해야 할 일</h2>
          </div>
          {!isStatusEditor ? (
            <Button variant="secondary" onClick={() => { setNewRuleType("do"); setDialogOpen(true); }}>
              항목 추가
            </Button>
          ) : null}
        </div>
        <div className="mt-4 space-y-3">
          {doRules.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              tone="do"
              onChangeStatus={
                isStatusEditor
                  ? (id, status) => updateRuleStatus("do", id, status)
                  : undefined
              }
              onDelete={!isStatusEditor ? (id) => deleteRule("do", id) : undefined}
              showStatus={isStatusEditor}
            />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Avoid list
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">피해야 할 일</h2>
          </div>
          {!isStatusEditor ? (
            <Button
              variant="secondary"
              onClick={() => {
                setNewRuleType("avoid");
                setDialogOpen(true);
              }}
            >
              항목 추가
            </Button>
          ) : null}
        </div>
        <div className="mt-4 space-y-3">
          {avoidRules.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              tone="avoid"
              onChangeStatus={
                isStatusEditor
                  ? (id, status) => updateRuleStatus("avoid", id, status)
                  : undefined
              }
              onDelete={!isStatusEditor ? (id) => deleteRule("avoid", id) : undefined}
              showStatus={isStatusEditor}
            />
          ))}
        </div>
      </Card>

      {!isStatusEditor ? <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          My record
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">나의 규칙 성적</h2>
        {performance.best && performance.hardest ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-line/80 bg-[#fff4ad] p-4">
              <span className="inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-ink">
                제일 잘 지켰어요
              </span>
              <p className="mt-3 break-keep text-base font-bold leading-6 text-ink">
                {performance.best.title}
              </p>
              <p className="mt-1 text-sm text-muted">
                {performance.best.attempts}번 중 {performance.best.successes}번 성공 ·{" "}
                {performance.best.successRate}%
              </p>
            </div>
            <div className="rounded-[20px] border border-line/80 bg-[#ffd7cf] p-4">
              <span className="inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-ink">
                제일 어려웠어요
              </span>
              <p className="mt-3 break-keep text-base font-bold leading-6 text-ink">
                {performance.hardest.title}
              </p>
              <p className="mt-1 text-sm text-muted">
                {performance.hardest.attempts}번 중 {performance.hardest.successes}번 성공 ·{" "}
                {performance.hardest.successRate}%
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 break-keep text-sm leading-6 text-muted">
            규칙을 성공 또는 실패로 기록하면 가장 잘 지킨 규칙과 어려웠던 규칙을 알려드릴게요.
          </p>
        )}
      </Card> : null}

      {!isStatusEditor ? <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Suggestions
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">앱이 추천하는 규칙</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          마음에 드는 규칙만 골라서 바로 추가해보세요.
        </p>
        {availableSuggestions.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {availableSuggestions.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => addSuggestion(item.title, item.type)}
                className="rounded-full border border-line/80 bg-white/75 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sage/60"
              >
                {item.title}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 break-keep text-sm leading-6 text-muted">
            추천 규칙을 모두 내 목록에 추가했어요.
          </p>
        )}
      </Card> : null}

      {!isStatusEditor ? <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Just for you
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">내 기록 맞춤 추천</h2>
        {personalized.recordedDays < 3 ? (
          <p className="mt-3 break-keep text-sm leading-6 text-muted">
            조금만 더 기록하면 내 생활 패턴에 꼭 맞는 규칙을 추천해드릴게요. 최근 7일 중
            3일 이상 기록하면 시작돼요.
          </p>
        ) : personalized.recommendations.length ? (
          <div className="mt-4 space-y-3">
            {personalized.recommendations.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-[20px] border border-line/80 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{item.type === "do" ? "해야 할 일" : "피해야 할 일"}</Badge>
                    <p className="break-keep font-bold text-ink">{item.title}</p>
                  </div>
                  <p className="mt-2 break-keep text-sm leading-6 text-muted">{item.reason}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addSuggestion(item.title, item.type)}
                  className="w-full sm:w-auto"
                >
                  추가
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 break-keep text-sm leading-6 text-muted">
            지금 기록에서는 새로 추가할 규칙이 없어요. 이미 필요한 규칙을 잘 골라두셨어요.
          </p>
        )}
      </Card> : null}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="새 규칙 추가"
        description="이번 주에 지키고 싶은 행동을 직접 추가해보세요."
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={newRuleType === "do" ? "primary" : "secondary"}
              onClick={() => setNewRuleType("do")}
              className="flex-1"
            >
              해야 할 일
            </Button>
            <Button
              variant={newRuleType === "avoid" ? "primary" : "secondary"}
              onClick={() => setNewRuleType("avoid")}
              className="flex-1"
            >
              피해야 할 일
            </Button>
          </div>

          <div>
            <label htmlFor="ruleTitle" className="mb-2 block text-sm font-semibold text-ink">
              규칙 이름
            </label>
            <Input
              id="ruleTitle"
              value={newRuleTitle}
              onChange={(event) => setNewRuleTitle(event.target.value)}
              placeholder="예: 저녁 식사 후 15분 걷기"
            />
          </div>

          <Button onClick={addRule} className="w-full">
            저장하기
          </Button>
        </div>
      </Dialog>
    </AppShell>
  );
}
