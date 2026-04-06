/**
 * Header Component
 * Application header with logo, search, and theme toggle
 */

import { useRef, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useMovieStore } from '@/store/movieStore';
import ImportProgressOverlay from '@/components/catalog/ImportProgressOverlay';
import SearchBar from '@/components/search/SearchBar';
import { useMovieSearch } from '@/hooks/useMovieSearch';
import { useSingaporeTime } from '@/hooks/useSingaporeTime';
import { useTranslation } from '@/i18n/useTranslation';

export interface HeaderProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Header component with branding, search, and theme toggle
 */
export default function Header({ className = '' }: HeaderProps) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const { searchTerm, setSearchTerm, clearSearch, isSearching, resultCount } = useMovieSearch();
  const loadMovies = useMovieStore((state) => state.loadMovies);
  const catalogLoading = useMovieStore((state) => state.isLoading);
  const { now, label: singaporeTime } = useSingaporeTime();
  const { t, locale, setLocale } = useTranslation();

  const [importing, setImporting] = useState(false);
  const [importOverlayOpen, setImportOverlayOpen] = useState(false);
  const [importLog, setImportLog] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const importAbortRef = useRef<AbortController | null>(null);

  const enableImport = import.meta.env.DEV && import.meta.env.VITE_ENABLE_IMPORT_API === 'true';

  const closeImportOverlay = () => {
    importAbortRef.current?.abort();
    importAbortRef.current = null;
    setImportOverlayOpen(false);
    setImportLog('');
    setImportError(null);
    setImporting(false);
  };

  const runImportThenReload = async () => {
    if (enableImport) {
      setImportOverlayOpen(true);
      setImportLog('');
      setImportError(null);
      setImporting(true);
      const ac = new AbortController();
      importAbortRef.current = ac;

      try {
        const res = await fetch('/api/refresh-catalog', { method: 'POST', signal: ac.signal });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText.slice(0, 2000) || res.statusText);
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buf = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value!, { stream: true });
          setImportLog(buf);
        }

        const exitMatch = buf.match(/__IMPORT_EXIT__ (\d+)/);
        const exitCode = exitMatch ? parseInt(exitMatch[1], 10) : 1;

        if (exitCode !== 0) {
          setImportError(t('import_progress_exit_error', { code: exitCode }));
          setImporting(false);
          return;
        }

        setImporting(false);
        await loadMovies();
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          setImportError(t('import_progress_aborted'));
        } else {
          console.error(e);
          setImportError(e instanceof Error ? e.message : String(e));
        }
        setImporting(false);
        return;
      } finally {
        importAbortRef.current = null;
      }
      return;
    }

    await loadMovies();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const catalogBusy = catalogLoading || importing;

  return (
    <>
      <ImportProgressOverlay
        open={importOverlayOpen}
        logText={importLog}
        busy={importing}
        errorMessage={importError}
        onClose={closeImportOverlay}
      />
      <header
        className={`sticky top-0 z-50 bg-apple-bg-primary/80 backdrop-blur-lg border-b border-apple-divider ${className}`}
      >
        <div className="container mx-auto px-4">
          {/* Top Row: Logo and Theme Toggle */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/assets/redhat-quay-logo.png" alt="Red Hat Quay" className="h-8" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <div
                className="flex rounded-lg overflow-hidden border border-apple-divider text-xs font-medium shrink-0"
                role="group"
                aria-label={t('header_lang_aria')}
              >
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`px-2.5 py-1.5 transition-colors ${
                    locale === 'en'
                      ? 'bg-apple-accent text-white'
                      : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                  }`}
                  aria-pressed={locale === 'en'}
                  aria-label={t('header_lang_en')}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('zh-CN')}
                  className={`px-2.5 py-1.5 transition-colors ${
                    locale === 'zh-CN'
                      ? 'bg-apple-accent text-white'
                      : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                  }`}
                  aria-pressed={locale === 'zh-CN'}
                  aria-label={t('header_lang_zh')}
                >
                  简
                </button>
              </div>
              <time
                dateTime={now.toISOString()}
                className={`text-sm tabular-nums whitespace-nowrap font-medium ${
                  theme === 'dark' ? 'text-apple-dark-accent' : 'text-apple-accent'
                }`}
                title={t('time_tooltip')}
              >
                {singaporeTime} {t('time_place')}
              </time>
              <button
                type="button"
                onClick={() => void runImportThenReload()}
                disabled={catalogBusy}
                className="px-2.5 py-1.5 rounded-lg text-sm font-medium border border-apple-divider bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                aria-label={t('header_update_aria')}
                aria-busy={catalogBusy}
                title={t('header_update_title')}
              >
                {importing
                  ? t('header_import_running')
                  : catalogLoading
                    ? t('header_update_loading')
                    : t('header_update_label')}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-apple-bg-secondary transition-colors shrink-0"
                aria-label={
                  theme === 'dark' ? t('header_theme_to_light') : t('header_theme_to_dark')
                }
              >
                <span className="text-2xl" aria-hidden>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Search Bar */}
          <div className="pb-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={clearSearch}
              isLoading={isSearching}
              resultCount={searchTerm ? resultCount : undefined}
              placeholder={t('search_placeholder')}
              inputAriaLabel={t('search_aria')}
              clearAriaLabel={t('search_clear_aria')}
              resultSummary={
                searchTerm && resultCount !== undefined
                  ? resultCount === 1
                    ? t('search_results_one', { count: resultCount })
                    : t('search_results_other', { count: resultCount })
                  : undefined
              }
            />
          </div>
        </div>
      </header>
    </>
  );
}
