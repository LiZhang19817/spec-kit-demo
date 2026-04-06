import type { AppLocale, UserPreferences } from '@/types/filters';
import { getItem, STORAGE_KEYS } from '@/lib/localStorage';
import { interpolate, MessageId, messagesByLocale } from './messages';

export function resolveLocale(value: unknown): AppLocale {
  return value === 'zh-CN' ? 'zh-CN' : 'en';
}

export function applyDocumentLocale(locale: AppLocale): void {
  document.documentElement.lang = locale === 'zh-CN' ? 'zh-Hans' : 'en';
}

export function getStoredLocale(): AppLocale {
  try {
    const stored = getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES);
    return resolveLocale(stored?.locale);
  } catch {
    return 'en';
  }
}

export function translate(
  locale: AppLocale,
  id: MessageId,
  vars?: Record<string, string | number>
): string {
  const table = messagesByLocale[locale] ?? messagesByLocale.en;
  const raw = table[id] ?? messagesByLocale.en[id] ?? String(id);
  return vars ? interpolate(raw, vars) : raw;
}
