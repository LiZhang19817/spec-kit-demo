/**
 * Live log while TMDB import runs (dev + VITE_ENABLE_IMPORT_API).
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

/** Hide the machine-readable exit line from the live view. */
export function stripImportExitMarker(raw: string): string {
  return raw.replace(/\n__IMPORT_EXIT__ \d+\s*$/, '').trimEnd();
}

export interface ImportProgressOverlayProps {
  open: boolean;
  logText: string;
  busy: boolean;
  errorMessage: string | null;
  onClose: () => void;
}

export default function ImportProgressOverlay({
  open,
  logText,
  busy,
  errorMessage,
  onClose,
}: ImportProgressOverlayProps) {
  const { t } = useTranslation();
  const preRef = useRef<HTMLPreElement>(null);

  const displayText = stripImportExitMarker(logText);

  useEffect(() => {
    const el = preRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logText]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-progress-title"
    >
      <div className="bg-apple-bg-secondary border border-apple-divider rounded-apple-lg shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-apple-divider">
          <h2 id="import-progress-title" className="text-lg font-semibold text-apple-text-primary">
            {t('import_progress_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg border border-apple-divider bg-apple-bg-primary hover:bg-apple-bg-tertiary"
          >
            {busy ? t('import_progress_cancel') : t('import_progress_close')}
          </button>
        </div>

        {errorMessage && (
          <p className="px-4 pt-3 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}

        <pre
          ref={preRef}
          className="flex-1 overflow-auto px-4 py-3 text-xs font-mono text-apple-text-primary whitespace-pre-wrap break-words bg-apple-bg-primary/50 m-3 rounded-apple-md min-h-[200px] max-h-[60vh]"
          aria-live="polite"
          aria-busy={busy}
        >
          {displayText || (busy ? t('import_progress_waiting') : '')}
        </pre>

        {busy && (
          <p className="px-4 pb-3 text-xs text-apple-text-secondary">{t('import_progress_hint')}</p>
        )}
      </div>
    </div>
  );
}
