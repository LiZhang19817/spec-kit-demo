import { useTranslation } from '@/i18n/useTranslation';

export interface FavoritesFilterSectionProps {
  showFavoritesOnly: boolean;
  onToggle: () => void;
}

export default function FavoritesFilterSection({
  showFavoritesOnly,
  onToggle,
}: FavoritesFilterSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-apple-text-primary">{t('filters_favorites')}</h3>
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={showFavoritesOnly}
          onChange={onToggle}
          aria-label={t('filters_favorites_aria')}
          className="w-5 h-5 rounded border-apple-divider text-apple-accent focus:ring-2 focus:ring-apple-accent cursor-pointer"
        />
        <span className="text-sm text-apple-text-primary group-hover:text-apple-accent transition-colors">
          {t('filters_favorites_only')}
        </span>
      </label>
    </div>
  );
}
