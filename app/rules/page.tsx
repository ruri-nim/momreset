"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/diet-app/app-shell";
import { CheckRow } from "@/components/diet-app/check-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getLocalDateKey } from "@/lib/diet-app-date";
import {
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
  const weekLabel = formatWeekLabel(new Date());
  const [doRules, setDoRules] = useState<RuleItem[]>([]);
  const [avoidRules, setAvoidRules] = useState<RuleItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState("");
  const [newRuleType, setNewRuleType] = useState<"do" | "avoid">("do");
  const hasSkippedInitialDoSave = useRef(false);
  const hasSkippedInitialAvoidSave = useRef(false);

  useEffect(() => {
    const savedDoRules = loadDoRules();
    const savedAvoidRules = loadAvoidRules();
    const todayHistory = getRuleHistoryForDate(todayKey);

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
  }, [todayKey]);

  useEffect(() => {
    if (!hasSkippedInitialDoSave.current) {
      hasSkippedInitialDoSave.current = true;
      return;
    }

    saveDoRules(doRules);
  }, [doRules]);

  useEffect(() => {
    if (!hasSkippedInitialAvoidSave.current) {
      hasSkippedInitialAvoidSave.current = true;
      return;
    }

    saveAvoidRules(avoidRules);
  }, [avoidRules]);

  const updateRuleStatus = (
    type: "do" | "avoid",
    id: string,
    status: RuleItem["status"],
  ) => {
    if (type === "do") {
      setDoRules((prev) => {
        const next = prev.map((item) => (item.id === id ? { ...item, status } : item));
        saveRuleStatusesForDate(todayKey, next, avoidRules);
        return next;
      });
      return;
    }

    setAvoidRules((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, status } : item));
      saveRuleStatusesForDate(todayKey, doRules, next);
      return next;
    });
  };

  const deleteRule = (type: "do" | "avoid", id: string) => {
    if (type === "do") {
      setDoRules((prev) => {
        const next = prev.filter((item) => item.id !== id);
        saveRuleStatusesForDate(todayKey, next, avoidRules);
        return next;
      });
      return;
    }

    setAvoidRules((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveRuleStatusesForDate(todayKey, doRules, next);
      return next;
    });
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
      setDoRules((prev) => {
        const next = [...prev, nextRule];
        saveRuleStatusesForDate(todayKey, next, avoidRules);
        return next;
      });
    } else {
      setAvoidRules((prev) => {
        const next = [...prev, nextRule];
        saveRuleStatusesForDate(todayKey, doRules, next);
        return next;
      });
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
      setAvoidRules((prev) => {
        const next = [...prev, nextRule];
        saveRuleStatusesForDate(todayKey, doRules, next);
        return next;
      });
      return;
    }

    setDoRules((prev) => {
      const next = [...prev, nextRule];
      saveRuleStatusesForDate(todayKey, next, avoidRules);
      return next;
    });
  };

  return (
    <AppShell
      eyebrow="Weekly rules"
      title="Rules"
      description="이번 주에 지키고 싶은 규칙을 내 방식대로 정해보세요."
    >
      <div className="flex flex-wrap gap-2">
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
          <Button variant="secondary" onClick={() => { setNewRuleType("do"); setDialogOpen(true); }}>
            항목 추가
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {doRules.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              tone="do"
              onChangeStatus={(id, status) => updateRuleStatus("do", id, status)}
              onDelete={(id) => deleteRule("do", id)}
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
          <Button
            variant="secondary"
            onClick={() => {
              setNewRuleType("avoid");
              setDialogOpen(true);
            }}
          >
            항목 추가
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {avoidRules.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              tone="avoid"
              onChangeStatus={(id, status) => updateRuleStatus("avoid", id, status)}
              onDelete={(id) => deleteRule("avoid", id)}
            />
          ))}
        </div>
      </Card>

      <Card>
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
      </Card>

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
