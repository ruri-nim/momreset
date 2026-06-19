export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthMeta(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return {
    year,
    month,
    firstWeekday: firstDay.getDay(),
    daysInMonth,
  };
}

export function formatMonthTitle(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatKoreanWeekRange(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const start = new Date(current);
  start.setDate(current.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

export function getDateKeyDaysAgo(daysAgo: number, baseDate = new Date()) {
  const next = new Date(baseDate);
  next.setDate(baseDate.getDate() - daysAgo);
  return getLocalDateKey(next);
}

export function isDateWithinLastDays(dateKey: string, days: number, baseDate = new Date()) {
  const target = new Date(`${dateKey}T00:00:00`);
  const today = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - (days - 1));

  return target >= minDate && target <= today;
}

export function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${month}.${day}`;
}
