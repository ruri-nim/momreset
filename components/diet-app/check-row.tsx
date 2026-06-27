import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuleItem } from "@/types/diet-app";

interface CheckRowProps {
  item: RuleItem;
  tone: "do" | "avoid";
  onChangeStatus?: (id: string, status: RuleItem["status"]) => void;
  onDelete?: (id: string) => void;
  showPendingAction?: boolean;
}

export function CheckRow({
  item,
  tone,
  onChangeStatus,
  onDelete,
  showPendingAction = false,
}: CheckRowProps) {
  const successEmoji = tone === "do" ? "🍀" : "🛡️";
  const failEmoji = tone === "do" ? "💤" : "🍰";
  const icon =
    item.status === "done" ? (
      <CheckCircle2 className="h-5 w-5 text-coral" />
    ) : item.status === "failed" ? (
      <XCircle className="h-5 w-5 text-rose-600" />
    ) : (
      <Circle className="h-5 w-5 text-muted" />
    );

  return (
    <div className="flex items-center justify-between rounded-[22px] border border-line/80 bg-white/70 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-ink">{item.title}</p>
        <p className="mt-1 text-xs text-muted">
          성공 또는 실패로 기록해보세요.
        </p>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
          item.status === "done" && "bg-emerald-100 text-emerald-700",
          item.status === "failed" && "bg-rose-100 text-rose-700",
          item.status === "pending" && "bg-peach text-muted",
        )}
        style={{
          boxShadow:
            item.status === "done"
              ? "0 8px 18px rgba(52, 211, 153, 0.18)"
              : item.status === "failed"
                ? "0 8px 18px rgba(251, 113, 133, 0.16)"
                : "none",
        }}
      >
        {item.status === "pending" ? icon : <span className="text-sm">{item.status === "done" ? successEmoji : failEmoji}</span>}
        <span>
          {item.status === "done" ? "성공" : item.status === "failed" ? "실패" : "체크 전"}
        </span>
      </div>
      {onChangeStatus ? (
        <div className="ml-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onChangeStatus(item.id, "done")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              item.status === "done"
                ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                : "border-line bg-white text-muted",
            )}
            style={{
              boxShadow:
                item.status === "done" ? "0 8px 18px rgba(52, 211, 153, 0.14)" : "none",
            }}
          >
            {item.status === "done" ? `${successEmoji} ` : ""}
            성공
          </button>
          <button
            type="button"
            onClick={() => onChangeStatus(item.id, "failed")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              item.status === "failed"
                ? "border-rose-300 bg-rose-100 text-rose-700"
                : "border-line bg-white text-muted",
            )}
            style={{
              boxShadow:
                item.status === "failed" ? "0 8px 18px rgba(251, 113, 133, 0.12)" : "none",
            }}
          >
            {item.status === "failed" ? `${failEmoji} ` : ""}
            실패
          </button>
          {showPendingAction ? (
            <button
              type="button"
              onClick={() => onChangeStatus(item.id, "pending")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                item.status === "pending"
                  ? "border-line bg-peach text-ink"
                  : "border-line bg-white text-muted",
              )}
            >
              대기
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted transition"
            >
              삭제
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
