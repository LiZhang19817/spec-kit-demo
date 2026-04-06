import { useEffect, useMemo } from 'react';
import { Movie } from '@/types/movie';
import { useUIStore } from '@/store/uiStore';
import { resolveLocale } from '@/i18n/locale';
import { getZhCacheKey, useTmdbZhStore } from '@/store/tmdbZhStore';

/**
 * Title and synopsis for display: TMDB zh-CN when locale is zh-CN (lazy-loaded), else catalog defaults.
 */
export function useMovieDisplayText(movie: Movie | null): {
  displayTitle: string;
  displayDescription: string;
  isResolvingZh: boolean;
} {
  const locale = useUIStore((s) => resolveLocale(s.preferences.locale));
  const apiKey = (import.meta.env.VITE_TMDB_API_KEY as string | undefined)?.trim() ?? '';

  const zhKey = useMemo(() => (movie ? getZhCacheKey(movie) : null), [movie]);
  const zhEntry = useTmdbZhStore((s) => (zhKey ? s.cache[zhKey] : undefined));
  const zhLoading = useTmdbZhStore((s) => (zhKey ? !!s.loading[zhKey] : false));
  const ensureChineseDetails = useTmdbZhStore((s) => s.ensureChineseDetails);

  useEffect(() => {
    if (!movie || locale !== 'zh-CN' || !apiKey || !zhKey) return;
    ensureChineseDetails(movie, apiKey);
  }, [locale, apiKey, zhKey, movie, ensureChineseDetails]);

  if (!movie) {
    return { displayTitle: '', displayDescription: '', isResolvingZh: false };
  }

  if (locale !== 'zh-CN' || !zhEntry) {
    return {
      displayTitle: movie.title,
      displayDescription: movie.description,
      isResolvingZh: locale === 'zh-CN' && !!apiKey && !!zhKey && zhLoading && !zhEntry,
    };
  }

  return {
    displayTitle: zhEntry.title,
    displayDescription: zhEntry.overview,
    isResolvingZh: false,
  };
}
