import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OnboardingCompleteProps {
  postpartumDay: number;
  stageLabel: string;
  onStart: () => void;
}

export default function OnboardingComplete({
  postpartumDay,
  stageLabel,
  onStart,
}: OnboardingCompleteProps) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-6 md:space-y-8" style={{ flex: 1 }}>
        <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Step 6</p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">준비가 되었어요</h2>
        <p className="max-w-xl text-base leading-7 text-emerald-50/80">
          입력한 정보를 바탕으로 MomReset이 회복 단계와 추천 흐름을 조정할게요.
        </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-emerald-900 bg-slate-950/55 p-5">
            <p className="text-sm text-emerald-200/80">산후 진행</p>
            <p className="mt-2 text-3xl font-semibold text-white">산후 {postpartumDay}일차</p>
          </div>
          <div className="rounded-3xl border border-emerald-900 bg-slate-950/55 p-5">
            <p className="text-sm text-emerald-200/80">회복 단계</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stageLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/15 text-emerald-100">회복 흐름 개인화 완료</Badge>
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          paddingTop: 16,
          marginTop: 16,
          background: "linear-gradient(180deg, rgba(5,9,20,0) 0%, rgba(5,9,20,0.96) 28%)",
        }}
      >
        <Button
          onClick={onStart}
          className="bg-emerald-500 px-6 py-3 text-base text-slate-950 hover:bg-emerald-400"
          style={{ width: "100%" }}
        >
          앱 시작하기
        </Button>
      </div>
    </div>
  );
}
