import { Language } from './types';

const LOCALES: Record<Language, string> = { en: 'en-US', es: 'es-ES' };

export function localeFor(language: Language): string {
  return LOCALES[language];
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function shiftIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function formatLongDate(isoDate: string, language: Language): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat(localeFor(language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatShortDate(isoDate: string, language: Language): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat(localeFor(language), {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTime(timestamp: string, language: Language): string {
  return new Intl.DateTimeFormat(localeFor(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'en',
  }).format(new Date(timestamp));
}

export function formatTimeRange(start: string, end: string, language: Language): string {
  return `${formatTime(start, language)} – ${formatTime(end, language)}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return `${hours}h ${rest}m`;
}

export function formatRating(rating: number, language: Language): string {
  return new Intl.NumberFormat(localeFor(language), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}

export function timeInputValue(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function combineDateTime(isoDate: string, time: string): string {
  return `${isoDate}T${time}:00`;
}

export function minutesBetween(isoDate: string, start: string, end: string): number {
  const startAt = new Date(combineDateTime(isoDate, start)).getTime();
  const endAt = new Date(combineDateTime(isoDate, end)).getTime();
  if (Number.isNaN(startAt) || Number.isNaN(endAt)) return 0;
  return Math.max(0, Math.round((endAt - startAt) / 60000));
}
