import { useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';
import type { MessageId } from './messages';
import { resolveLocale, translate } from './locale';

export { applyDocumentLocale, getStoredLocale, resolveLocale, translate } from './locale';

export function useTranslation() {
  const rawLocale = useUIStore((s) => s.preferences.locale);
  const locale = resolveLocale(rawLocale);
  const setLocale = useUIStore((s) => s.setLocale);

  const t = useCallback(
    (id: MessageId, vars?: Record<string, string | number>) => translate(locale, id, vars),
    [locale]
  );

  return { t, locale, setLocale };
}
