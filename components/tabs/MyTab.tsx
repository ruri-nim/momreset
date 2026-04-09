"use client";

import { Bell, ChevronRight, HardDrive, LockKeyhole, MessageCircle, Moon, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatGuestSessionStartedAt } from "@/lib/guest-session";
import type { AppState, AuthMode } from "@/types/app";

interface MyTabProps {
  state: AppState;
  onAuthModeChange: (mode: AuthMode) => void;
  onToggleNotifications: () => void;
  onToggleDarkMode: () => void;
}

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-4 py-2 text-sm font-semibold transition"
      style={{
        borderColor: active ? "rgba(16,185,129,0.36)" : "rgb(var(--color-line) / 0.95)",
        background: active ? "rgba(16,185,129,0.12)" : "var(--card-background-strong)",
        color: active ? "rgb(var(--color-coral))" : "var(--text-soft)",
      }}
    >
      {label}
    </button>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  trailing,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-[22px] border px-4 py-4"
      style={{
        borderColor: "rgb(var(--color-line) / 0.82)",
        background: "rgb(var(--color-peach) / 0.78)",
      }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage/20 text-[#0ea784]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{subtitle}</p>
      </div>
      {trailing ?? <ChevronRight size={18} className="text-muted" />}
    </div>
  );
}

export default function MyTab({
  state,
  onAuthModeChange,
  onToggleNotifications,
  onToggleDarkMode,
}: MyTabProps) {
  const authMode = state.ui.authMode ?? "guest";
  const isGuestMode = authMode === "guest";
  const notificationsEnabled = state.ui.notificationsEnabled ?? true;
  const darkModeEnabled = state.ui.darkModeEnabled ?? false;
  const guestStartedAt = formatGuestSessionStartedAt(state.ui.guestSessionStartedAt);

  return (
    <div className="space-y-4">
      <Card className="px-4 py-5 md:px-5 md:py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">My</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">{state.profile.name}님</h3>
            <p className="korean-copy mt-2 text-sm leading-6 text-muted">
              {isGuestMode
                ? "지금은 게스트로 사용 중이에요. 핵심 기록은 이 기기에 그대로 저장돼요."
                : "로그인 연결은 가안 단계이고, 실제 인증 연동은 다음 단계에서 붙이면 돼요."}
            </p>
          </div>
          <div className="rounded-full bg-sage/20 px-3 py-2 text-xs font-semibold text-[#059669]">
            {authMode === "google"
              ? "구글 선택"
              : authMode === "kakao"
                ? "카카오 선택"
                : "게스트 모드"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <ToggleChip
            active={authMode === "google"}
            label="구글 로그인"
            onClick={() => onAuthModeChange("google")}
          />
          <ToggleChip
            active={authMode === "kakao"}
            label="카카오 로그인"
            onClick={() => onAuthModeChange("kakao")}
          />
          <ToggleChip
            active={authMode === "guest"}
            label="게스트 모드"
            onClick={() => onAuthModeChange("guest")}
          />
        </div>
      </Card>

      {isGuestMode ? (
        <Card className="px-4 py-5 md:px-5 md:py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage/20 text-[#0ea784]">
              <HardDrive size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">게스트 세션 사용 중</p>
              <p className="korean-copy mt-1 text-sm leading-6 text-muted">
                {guestStartedAt}부터 이 기기에서 기록을 이어가고 있어요. 나중에 구글이나 카카오 계정을 붙이면 이 기록을 연결하는 방향으로 확장할 수 있어요.
              </p>
              <div className="mt-4 rounded-[20px] bg-peach/60 px-4 py-3 text-xs leading-5 text-muted">
                앱 삭제나 브라우저 데이터 정리 시 게스트 기록은 사라질 수 있어요.
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">앱 설정</h3>
        <div className="mt-4 space-y-3">
          <button type="button" onClick={onToggleNotifications} className="w-full text-left">
            <SettingRow
              icon={<Bell size={20} />}
              title="알림 설정"
              subtitle={
                notificationsEnabled
                  ? "체크인 알림을 받을 수 있게 준비돼 있어요."
                  : "지금은 알림이 꺼져 있어요."
              }
              trailing={
                <div className="rounded-full bg-peach/70 px-3 py-2 text-xs font-semibold text-ink">
                  {notificationsEnabled ? "켜짐" : "꺼짐"}
                </div>
              }
            />
          </button>

          <button type="button" onClick={onToggleDarkMode} className="w-full text-left">
            <SettingRow
              icon={<Moon size={20} />}
              title="다크 모드"
              subtitle={
                darkModeEnabled
                  ? "다크 모드 초안을 선택해둔 상태예요."
                  : "현재는 기본 밝은 테마로 보고 있어요."
              }
              trailing={
                <div className="rounded-full bg-peach/70 px-3 py-2 text-xs font-semibold text-ink">
                  {darkModeEnabled ? "ON" : "OFF"}
                </div>
              }
            />
          </button>
        </div>
      </Card>

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">정책 안내</h3>
        <div className="mt-4 space-y-3">
          <SettingRow
            icon={<LockKeyhole size={20} />}
            title="이용약관"
            subtitle="정식 연결 전까지는 임시 안내 내용이 들어갈 자리예요."
          />
          <SettingRow
            icon={<UserRound size={20} />}
            title="개인정보처리방침"
            subtitle="로그인과 기록 저장 정책을 연결할 자리로 비워둘게요."
          />
        </div>
      </Card>

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-[#0ea784]">
            <MessageCircle size={18} />
          </div>
          <p className="korean-copy text-sm leading-6 text-muted">
            지금은 실제 인증 연동 전 단계라서, 선택한 로그인 방식과 설정 상태만 기기에 저장됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
