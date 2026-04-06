import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * Primary navigation between Netflix and Max catalog pages
 */
export default function StreamingCatalogNav() {
  const { t } = useTranslation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex-1 sm:flex-none text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-apple-accent text-white shadow-sm'
        : 'bg-apple-bg-secondary text-apple-text-secondary hover:bg-apple-bg-tertiary hover:text-apple-text-primary'
    }`;

  return (
    <nav
      className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center pb-4 border-b border-apple-divider/60"
      aria-label={t('nav_streaming_aria')}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-apple-text-tertiary sm:mr-1 sm:shrink-0">
        {t('nav_streaming_label')}
      </span>
      <div className="flex gap-2 flex-1 sm:justify-start">
        <NavLink to="/netflix" className={linkClass} end>
          <span className="inline-flex items-center justify-center gap-2">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-black bg-red-600 text-white"
              aria-hidden
            >
              N
            </span>
            {t('nav_catalog_netflix')}
          </span>
        </NavLink>
        <NavLink to="/max" className={linkClass}>
          <span className="inline-flex items-center justify-center gap-2">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-black bg-violet-700 text-white"
              aria-hidden
            >
              M
            </span>
            {t('nav_catalog_max')}
          </span>
        </NavLink>
      </div>
    </nav>
  );
}
