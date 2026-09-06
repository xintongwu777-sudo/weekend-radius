import { WeekendDay } from '../types/index';

const DAY_INDEX: Record<WeekendDay, number> = { saturday: 6, sunday: 0 };

export function getNextWeekendDate(day: WeekendDay): string {
  const now = new Date();
  const target = DAY_INDEX[day];
  let add = (target - now.getDay() + 7) % 7;
  if (add === 0 && now.getHours() >= 22) add = 7;
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add);
  return formatDateKey(date);
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTimestamp(dateKey: string, time: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
}

export function dailyTimeWindow(dateKey: string, openTime: string, closeTime: string): { openAt: number; closeAt: number } {
  const openAt = toTimestamp(dateKey, openTime);
  let closeAt = toTimestamp(dateKey, closeTime);
  if (closeAt <= openAt) closeAt += 24 * 60 * 60 * 1000;
  return { openAt, closeAt };
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatChineseDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}月${day}日 ${weekdays[date.getDay()]}`;
}

export function addMinutes(timestamp: number, minutes: number): number {
  return timestamp + minutes * 60 * 1000;
}

export function minutesBetween(start: number, end: number): number {
  return Math.max(0, Math.round((end - start) / 60000));
}
