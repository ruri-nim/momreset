"use client";

import { useMemo, useState } from "react";
import OnboardingBirthStep from "@/components/onboarding/OnboardingBirthStep";
import OnboardingComplete from "@/components/onboarding/OnboardingComplete";
import OnboardingFeedingStep from "@/components/onboarding/OnboardingFeedingStep";
import OnboardingGoalStep from "@/components/onboarding/OnboardingGoalStep";
import OnboardingIntro from "@/components/onboarding/OnboardingIntro";
import OnboardingWeightStep from "@/components/onboarding/OnboardingWeightStep";
import { Button } from "@/components/ui/button";
import {
  clearOnboardingData,
  getPostpartumDayFromBirthDate,
  getRecoveryStageLabel,
} from "@/lib/onboarding";
import { APP_STORAGE_KEY } from "@/lib/storage";
import type { OnboardingData } from "@/types/app";

interface OnboardingFlowProps {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onComplete: () => void;
}

const totalSteps = 6;

export default function OnboardingFlow({
  data,
  onChange,
  onComplete,
}: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [hasSelectedFeeding, setHasSelectedFeeding] = useState(false);
  const [hasSelectedGoal, setHasSelectedGoal] = useState(false);
  const postpartumDay = useMemo(
    () => getPostpartumDayFromBirthDate(data.birthDate),
    [data.birthDate],
  );
  const stageLabel = useMemo(() => getRecoveryStageLabel(postpartumDay), [postpartumDay]);

  function nextStep() {
    setStep((current) => Math.min(totalSteps, current + 1));
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1));
  }

  function handleResetDebug() {
    clearOnboardingData();
    window.localStorage.removeItem(APP_STORAGE_KEY);
    window.location.reload();
  }

  const currentStepContent =
    step === 1 ? (
      <OnboardingIntro onNext={nextStep} />
    ) : step === 2 ? (
      <OnboardingBirthStep
        data={data}
        onChange={onChange}
        onNext={nextStep}
        onBack={previousStep}
      />
    ) : step === 3 ? (
      <OnboardingFeedingStep
        data={data}
        onChange={(patch) => {
          setHasSelectedFeeding(true);
          onChange(patch);
        }}
        onNext={nextStep}
        onBack={previousStep}
        hasSelected={hasSelectedFeeding}
      />
    ) : step === 4 ? (
      <OnboardingWeightStep
        data={data}
        onChange={onChange}
        onNext={nextStep}
        onBack={previousStep}
      />
    ) : step === 5 ? (
      <OnboardingGoalStep
        data={data}
        onChange={(patch) => {
          setHasSelectedGoal(true);
          onChange(patch);
        }}
        onNext={nextStep}
        onBack={previousStep}
        hasSelected={hasSelectedGoal}
      />
    ) : (
      <OnboardingComplete
        postpartumDay={postpartumDay}
        stageLabel={stageLabel}
        onStart={onComplete}
      />
    );

  return (
    <main className="min-h-screen bg-black px-3 py-4 text-white md:px-8 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-4xl items-center">
        <div className="w-full">
          <section className="mx-auto max-w-[430px] rounded-[28px] border border-emerald-950 bg-gradient-to-br from-emerald-950 via-slate-950 to-black p-4 shadow-soft md:rounded-[36px] md:p-6">
            <div className="mb-6 md:mb-8">
              <p className="text-sm text-emerald-200/80">첫 설정</p>
              <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">회복 흐름을 개인화할게요</h2>
              <div className="mt-4 h-2 rounded-full bg-white/10 md:mt-5">
                <div
                  className="h-2 rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-emerald-50/70">
                {step} / {totalSteps} 단계
              </p>
            </div>

            <div className="space-y-4 text-sm leading-6 text-emerald-50/75">
              <p>산후 일차, 회복 단계, 수유 부담, 체중 흐름을 이해해야 MomReset이 더 정확해져요.</p>
              <p>입력한 정보는 온보딩 상태로 따로 저장되고, 일일 기록과는 분리되어 관리돼요.</p>
            </div>

            {process.env.NODE_ENV === "development" ? (
              <div className="mt-8">
                <Button
                  variant="ghost"
                  onClick={handleResetDebug}
                  className="border border-emerald-900 text-emerald-100 hover:bg-white/10"
                >
                  Reset Onboarding
                </Button>
              </div>
            ) : null}
            <div
              key={step}
              style={{
                minHeight: "68vh",
                maxHeight: "68vh",
                color: "#ffffff",
                width: "100%",
                marginTop: 24,
                paddingTop: 24,
                overflowY: "auto",
                paddingBottom: 8,
                borderTop: "1px solid rgba(16,185,129,0.16)",
              }}
            >
              {currentStepContent}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
