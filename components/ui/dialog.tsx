import { X } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  panelStyle?: CSSProperties;
  bodyClassName?: string;
}

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  className,
  panelStyle,
  bodyClassName,
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 220,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: "rgba(7, 10, 8, 0.58)",
        padding: "18px 16px 112px",
      }}
      className="fixed inset-0 z-[220] flex items-start justify-center bg-ink/30 p-4"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "calc(100vh - 130px)",
          borderRadius: 28,
          padding: 20,
          boxShadow: "0 28px 60px rgba(0, 0, 0, 0.28)",
          overflow: "hidden",
          marginTop: 8,
          background: "var(--card-background-strong)",
          color: "rgb(var(--color-ink))",
          ...panelStyle,
        }}
        className={cn("w-full max-w-lg rounded-[28px] bg-surface p-6 shadow-soft", className)}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">
              {title}
            </h3>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-full p-0"
            onClick={onClose}
            style={{
              background: "rgb(var(--color-peach) / 0.88)",
              border: "1px solid rgb(var(--color-line) / 0.92)",
              color: "rgb(var(--color-ink))",
            }}
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </Button>
        </div>
        <div
          style={{
            maxHeight: "calc(100vh - 242px)",
            overflowY: "auto",
            paddingBottom: 4,
          }}
          className={bodyClassName}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
