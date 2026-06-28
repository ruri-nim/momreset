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
  saveAvoidRules,
  saveDoRules,
  saveRuleStatusesForDate,
} from "@/lib/diet-app-storage";
import type { RuleItem } from "@/types/diet-app";

const suggestions = [
  "하루 물 2L 마시기",
  "점심 후 15분 걷기",
  "저녁에 단백질 1회 꼭 챙기기",
  "밤 7시 이후 야식 먹지 않기",
  "달달한 음료 먹지 않기",
  "디저트 먹지 않기",
  "배달음식 먹지 않기",
];

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

  useEffect(() => {
    const loadData = () => {
      const savedDoRules = loadDoRules();
      const savedAvoidRules = loadAvoidRules();
      const todayHistory = getRuleHistoryForDate(viewDateKey);

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

  const addSuggestion = (title: string) => {
    const isAvoid = title.includes("먹지 않기") || title.includes("줄이기");

    if (hasRuleTitle(doRules, title) || hasRuleTitle(avoidRules, title)) {
      return;
    }

    const nextRule: RuleItem = {
      id: crypto.randomUUID(),
      title,
      status: "pending",
    };

    if (isAvoid) {
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

  return (
    <AppShell
      eyebrow="Weekly rules"
      title="Rules"
      description={`${dateLabel} 규칙의 성공과 실패를 기록해보세요.`}
      embedded={isEmbedded}
    >
      <div className="flex flex-wrap gap-2">
        {!isToday ? <Badge>{dateLabel} 기록 수정 중</Badge> : null}
        <Badge>해야 할 일 {doRules.length}개</Badge>
        <Badge
          style={{ background: "rgb(var(--color-peach) / 0.95)", color: "rgb(var(--color-ink))" }}
        >
          피해야 할 일 {avoidRules.length}개
        </Badge>
      </div>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          This week
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{weekLabel}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          너무 많지 않게, 내가 지킬 수 있는 기준으로 정하면 좋아요.
        </p>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Do list
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">해야 할 일</h2>
          </div>
          {isToday ? (
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
              onChangeStatus={(id, status) => updateRuleStatus("do", id, status)}
              onDelete={isToday ? (id) => deleteRule("do", id) : undefined}
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
          {isToday ? (
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
              onChangeStatus={(id, status) => updateRuleStatus("avoid", id, status)}
              onDelete={isToday ? (id) => deleteRule("avoid", id) : undefined}
            />
          ))}
        </div>
      </Card>

      {isToday ? <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Suggestions
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">앱이 추천하는 규칙</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          마음에 드는 규칙만 골라서 바로 추가해보세요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addSuggestion(item)}
              className="rounded-full border border-line/80 bg-white/75 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sage/60"
            >
              {item}
            </button>
          ))}
        </div>
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
