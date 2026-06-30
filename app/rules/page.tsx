"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/diet-app/app-shell";
import { CheckRow } from "@/components/diet-app/check-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  formatMonthTitle,
  getCurrentMonthMeta,
  getLocalDateKey,
} from "@/lib/diet-app-date";
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

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

interface SelectedRuleHistory {
  rule: RuleItem;
  type: "do" | "avoid";
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
  const [selectedRuleHistory, setSelectedRuleHistory] =
    useState<SelectedRuleHistory | null>(null);
  const [historyMonthDate, setHistoryMonthDate] = useState(
    new Date(viewDate.getFullYear(), viewDate.getMonth(), 1),
  );
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

  const selectedRuleStats = useMemo(() => {
    if (!selectedRuleHistory) {
      return { achieved: 0, recorded: 0 };
    }

    const statusKey =
      selectedRuleHistory.type === "do" ? "doRuleStatuses" : "avoidRuleStatuses";
    const statuses = ruleHistory
      .map((entry) => entry[statusKey][selectedRuleHistory.rule.id])
      .filter((status) => status === "done" || status === "failed");

    return {
      achieved: statuses.filter((status) => status === "done").length,
      recorded: statuses.length,
    };
  }, [ruleHistory, selectedRuleHistory]);

  const historyCalendarCells = useMemo(() => {
    if (!selectedRuleHistory) {
      return [];
    }

    const { year, month, firstWeekday, daysInMonth } =
      getCurrentMonthMeta(historyMonthDate);
    const statusKey =
      selectedRuleHistory.type === "do" ? "doRuleStatuses" : "avoidRuleStatuses";
    const historyByDate = new Map(ruleHistory.map((entry) => [entry.date, entry]));
    const blanks = Array.from({ length: firstWeekday }, (_, index) => ({
      key: `blank-${index}`,
      day: null,
      status: null,
    }));
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = `${year}-${`${month + 1}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
      const entry = historyByDate.get(dateKey);

      return {
        key: dateKey,
        day,
        status: entry?.[statusKey][selectedRuleHistory.rule.id] ?? null,
      };
    });

    return [...blanks, ...days];
  }, [historyMonthDate, ruleHistory, selectedRuleHistory]);

  const openRuleHistory = (rule: RuleItem, type: "do" | "avoid") => {
    setHistoryMonthDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
    setSelectedRuleHistory({ rule, type });
  };

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
              onClick={!isStatusEditor ? () => openRuleHistory(item, "do") : undefined}
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
              onClick={!isStatusEditor ? () => openRuleHistory(item, "avoid") : undefined}
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

      <Dialog
        open={Boolean(selectedRuleHistory)}
        onClose={() => setSelectedRuleHistory(null)}
        title={selectedRuleHistory?.rule.title ?? "규칙 기록"}
        description="내가 이 규칙을 지킨 날을 O와 X 스티커로 모아봤어요."
        className="max-w-[620px]"
        panelStyle={{
          background:
            "linear-gradient(155deg, rgba(255,253,241,0.99), rgba(255,247,191,0.98))",
          border: "2px solid rgba(255, 157, 139, 0.45)",
        }}
      >
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[24px] border border-line/70 bg-white/75 p-4">
            <span className="absolute -right-3 -top-4 rotate-12 text-5xl opacity-20">
              {selectedRuleHistory?.type === "do" ? "🍀" : "🛡️"}
            </span>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">
              My rule score
            </p>
            <div className="mt-3 flex items-end gap-2">
              <strong className="text-4xl font-black leading-none text-ink">
                {selectedRuleStats.achieved}일
              </strong>
              <span className="pb-1 text-base font-bold text-muted">
                / 총 {selectedRuleStats.recorded}일
              </span>
            </div>
            <p className="mt-2 break-keep text-sm leading-6 text-muted">
              성공 또는 실패로 체크한 날짜만 모아서 보여드려요.
            </p>
          </div>

          <div className="rounded-[26px] border border-line/75 bg-[#fffdf5]/90 p-3.5 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                aria-label="이전 달"
                onClick={() =>
                  setHistoryMonthDate(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line/80 bg-white text-ink transition hover:-rotate-6 hover:bg-[#fff4ad]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">
                  O X Calendar
                </p>
                <h4 className="mt-1 whitespace-nowrap text-xl font-black text-ink">
                  {formatMonthTitle(historyMonthDate)}
                </h4>
              </div>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() =>
                  setHistoryMonthDate(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line/80 bg-white text-ink transition hover:rotate-6 hover:bg-[#fff4ad]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="pb-1 text-center text-[11px] font-black text-muted"
                >
                  {label}
                </div>
              ))}
              {historyCalendarCells.map((cell) =>
                cell.day ? (
                  <div
                    key={cell.key}
                    className={[
                      "relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-[14px] border text-center sm:rounded-[18px]",
                      cell.status === "done"
                        ? "rotate-[-2deg] border-[#7ed6a4] bg-[#c9f3d7] shadow-[0_6px_12px_rgba(72,187,120,0.16)]"
                        : cell.status === "failed"
                          ? "rotate-[2deg] border-[#ff9c91] bg-[#ffd7cf] shadow-[0_6px_12px_rgba(255,112,99,0.13)]"
                          : "border-line/45 bg-white/65",
                    ].join(" ")}
                  >
                    <span className="absolute left-1.5 top-1 text-[9px] font-bold text-muted sm:left-2 sm:top-1.5">
                      {cell.day}
                    </span>
                    {cell.status === "done" ? (
                      <span className="text-xl font-black text-emerald-700 sm:text-2xl">
                        O
                      </span>
                    ) : cell.status === "failed" ? (
                      <span className="text-xl font-black text-rose-600 sm:text-2xl">
                        X
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-line">·</span>
                    )}
                  </div>
                ) : (
                  <div key={cell.key} aria-hidden="true" className="aspect-square" />
                ),
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-[#c9f3d7] px-3 py-1.5 text-emerald-700">
                O 지켰어요
              </span>
              <span className="rounded-full bg-[#ffd7cf] px-3 py-1.5 text-rose-600">
                X 놓쳤어요
              </span>
            </div>
          </div>
        </div>
      </Dialog>
    </AppShell>
  );
}
