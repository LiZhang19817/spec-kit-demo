/**
 * Shows new and removed titles after the user refreshes the catalog (Update button).
 */

import { useMovieStore } from '@/store/movieStore';
import { useTranslation } from '@/i18n/useTranslation';
import { interpolate } from '@/i18n/messages';

const MAX_VISIBLE = 12;

export default function CatalogUpdateBanner() {
  const diff = useMovieStore((s) => s.lastCatalogDiff);
  const clearCatalogDiff = useMovieStore((s) => s.clearCatalogDiff);
  const { t } = useTranslation();

  if (!diff) {
    return null;
  }

  const { added, removed, totalCount } = diff;
  const hasChanges = added.length > 0 || removed.length > 0;

  const addedVisible = added.slice(0, MAX_VISIBLE);
  const removedVisible = removed.slice(0, MAX_VISIBLE);
  const addedMore = Math.max(0, added.length - MAX_VISIBLE);
  const removedMore = Math.max(0, removed.length - MAX_VISIBLE);

  return (
    <div
      className="border-b border-apple-divider bg-apple-bg-secondary/95"
      role="region"
      aria-label={t('catalog_update_region_aria')}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between gap-y-2">
          <p className="text-sm font-medium text-apple-text-primary pr-2">
            {hasChanges
              ? interpolate(t('catalog_update_summary_changes'), {
                  total: totalCount,
                  addedN: added.length,
                  removedN: removed.length,
                })
              : interpolate(t('catalog_update_summary_no_changes'), { total: totalCount })}
          </p>
          <button
            type="button"
            onClick={clearCatalogDiff}
            className="shrink-0 self-start px-3 py-1.5 text-sm rounded-lg border border-apple-divider bg-apple-bg-primary text-apple-text-primary hover:bg-apple-bg-tertiary transition-colors"
          >
            {t('catalog_update_dismiss')}
          </button>
        </div>

        {hasChanges && (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {added.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-apple-text-secondary mb-2">
                  {t('catalog_update_new_heading')} ({added.length})
                </h3>
                <ul className="max-h-52 overflow-y-auto space-y-1.5 text-sm text-apple-text-primary list-none pl-0">
                  {addedVisible.map((m) => (
                    <li key={m.id} className="flex items-baseline gap-2 flex-wrap">
                      <span className="min-w-0 break-words">{m.title}</span>
                      <span className="text-xs text-apple-text-tertiary shrink-0">
                        (
                        {m.type === 'series'
                          ? t('catalog_update_type_series')
                          : t('catalog_update_type_movie')}
                        )
                      </span>
                    </li>
                  ))}
                </ul>
                {addedMore > 0 && (
                  <p className="mt-2 text-xs text-apple-text-secondary">
                    {interpolate(t('catalog_update_more'), { count: addedMore })}
                  </p>
                )}
              </div>
            )}

            {removed.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-apple-text-secondary mb-2">
                  {t('catalog_update_removed_heading')} ({removed.length})
                </h3>
                <ul className="max-h-52 overflow-y-auto space-y-1.5 text-sm text-apple-text-primary list-none pl-0">
                  {removedVisible.map((r) => (
                    <li key={r.id} className="break-words">
                      {r.title}
                    </li>
                  ))}
                </ul>
                {removedMore > 0 && (
                  <p className="mt-2 text-xs text-apple-text-secondary">
                    {interpolate(t('catalog_update_more'), { count: removedMore })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
